import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as XLSX from "xlsx";

const BUCKET_NAME = "repair-archives";

// ==================================================
// Types
// ==================================================

type RepairJob = {
  id: string;
  job_number: string;
  qr_token: string;
  customer_name: string;
  phone: string;
  device: string;
  brand: string | null;
  model: string | null;
  problem: string;
  repair_detail: string | null;
  status: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  warranty_expiry: string | null;
  created_at: string;
  updated_at: string;
  serial_number: string | null;
  diagnosis: string | null;
  technician: string | null;
  warranty_days: number | null;
  has_warranty: boolean | null;
};

type StatusHistory = {
  id: string;
  repair_job_id: string;
  status: string;
  note: string | null;
  by_name: string | null;
  created_at: string;
};

type ArchiveLog = {
  id: string;
  export_date: string;
  file_name: string;
  storage_path: string;
  record_count: number;
  status: string;
  created_at: string;
};

type QueryError = {
  message: string;
};

type QueryResult<T> = {
  data: T | null;
  error: QueryError | null;
};

type QueryBuilder<T> = {
  select: (
    columns?: string,
  ) => QueryBuilder<T>;

  order: (
    column: string,
    options?: {
      ascending?: boolean;
    },
  ) => Promise<QueryResult<T[]>>;

  eq: (
    column: string,
    value: string,
  ) => QueryBuilder<T>;

  not: (
    column: string,
    operator: string,
    value: string | null,
  ) => QueryBuilder<T>;

  lte: (
    column: string,
    value: string,
  ) => QueryBuilder<T>;

  in: (
    column: string,
    values: string[],
  ) => QueryBuilder<T>;

  insert: (
    values: Record<string, unknown>,
  ) => QueryBuilder<T>;

  update: (
    values: Record<string, unknown>,
  ) => QueryBuilder<T>;

  delete: () => DeleteBuilder<T>;

  maybeSingle: () => Promise<QueryResult<T>>;

  single: () => Promise<QueryResult<T>>;
};

type DeleteBuilder<T> = {
  in: (
    column: string,
    values: string[],
  ) => DeleteSelectBuilder<T>;
};

type DeleteSelectBuilder<T> = {
  select: (
    columns?: string,
  ) => Promise<QueryResult<T[]>>;
};

type StorageUploadResult = {
  error: QueryError | null;
};

type StorageBucket = {
  upload: (
    path: string,
    file: Uint8Array,
    options?: {
      contentType?: string;
      upsert?: boolean;
    },
  ) => Promise<StorageUploadResult>;

  exists: (
    path: string,
  ) => Promise<{
    data: boolean;
    error: QueryError | null;
  }>;
};

type ArchiveSupabaseClient = {
  from: <T>(
    table: string,
  ) => QueryBuilder<T>;

  storage: {
    from: (
      bucket: string,
    ) => StorageBucket;
  };
};

// ==================================================
// Edge Function
// ==================================================

export default {
  fetch: withSupabase(
    { auth: "secret" },

    async (_req, ctx) => {
      try {
        // ==================================================
        // Supabase Admin Client
        // ==================================================

        const admin =
          ctx.supabaseAdmin as unknown as ArchiveSupabaseClient;

        // ==================================================
        // 1. คำนวณวันหมดอายุที่ Archive ได้
        // ==================================================

        const archiveCutoffDate =
          new Date();

        archiveCutoffDate.setFullYear(
          archiveCutoffDate.getFullYear() - 1,
        );

        const archiveCutoff =
          archiveCutoffDate
            .toISOString()
            .slice(0, 10);

        // ==================================================
        // 2. ดึงเฉพาะ repair_jobs ที่เข้าเงื่อนไข
        //
        // status = "หมดประกัน"
        // warranty_expiry <= วันนี้ย้อนหลัง 1 ปี
        // ==================================================

        const {
          data: repairJobsData,
          error: jobsError,
        } = await admin
          .from<RepairJob>("repair_jobs")
          .select("*")
          .eq(
            "status",
            "หมดประกัน",
          )
          .not(
            "warranty_expiry",
            "is",
            null,
          )
          .lte(
            "warranty_expiry",
            archiveCutoff,
          )
          .order(
            "warranty_expiry",
            {
              ascending: true,
            },
          );

        if (jobsError) {
          throw new Error(
            `Failed to fetch repair_jobs: ${jobsError.message}`,
          );
        }

        const repairJobs =
          repairJobsData ?? [];

        // ==================================================
        // 3. ไม่มีรายการที่เข้าเงื่อนไข
        // ==================================================

        if (repairJobs.length === 0) {
          return Response.json({
            success: true,
            mode: "LIVE",
            message:
              "No repair jobs are eligible for archive.",
            archive_cutoff_date:
              archiveCutoff,
            archive_job_count: 0,
            deleted: false,
          });
        }

        // ==================================================
        // 4. เก็บ ID ที่จะ Archive
        // ==================================================

        const archiveJobIds =
          repairJobs.map(
            (job: RepairJob) => job.id,
          );

        // ==================================================
        // 5. ดึง Status History ของเฉพาะงานที่จะ Archive
        // ==================================================

        const {
          data: statusHistoryData,
          error: historyError,
        } = await admin
          .from<StatusHistory>(
            "repair_status_history",
          )
          .select("*")
          .in(
            "repair_job_id",
            archiveJobIds,
          )
          .order(
            "created_at",
            {
              ascending: true,
            },
          );

        if (historyError) {
          throw new Error(
            `Failed to fetch repair_status_history: ${historyError.message}`,
          );
        }

        const statusHistory =
          statusHistoryData ?? [];

        // ==================================================
        // 6. เตรียมข้อมูล Repair Jobs สำหรับ Excel
        // ==================================================

        const jobsForExcel =
          repairJobs.map(
            (job: RepairJob) => ({
              ID: job.id,
              "Job Number":
                job.job_number,
              "QR Token":
                job.qr_token,
              "Customer Name":
                job.customer_name,
              Phone: job.phone,
              Device: job.device,
              Brand: job.brand,
              Model: job.model,
              "Serial Number":
                job.serial_number,
              Problem: job.problem,
              Diagnosis: job.diagnosis,
              "Repair Detail":
                job.repair_detail,
              Status: job.status,
              "Estimated Cost":
                job.estimated_cost,
              "Actual Cost":
                job.actual_cost,
              Technician:
                job.technician,
              "Warranty Days":
                job.warranty_days,
              "Warranty Expiry":
                job.warranty_expiry,
              "Has Warranty":
                job.has_warranty,
              "Created At":
                job.created_at,
              "Updated At":
                job.updated_at,
            }),
          );

        // ==================================================
        // 7. เตรียม Status History สำหรับ Excel
        // ==================================================

        const historyForExcel =
          statusHistory.map(
            (history: StatusHistory) => ({
              ID: history.id,
              "Repair Job ID":
                history.repair_job_id,
              Status:
                history.status,
              Note:
                history.note,
              "By Name":
                history.by_name,
              "Created At":
                history.created_at,
            }),
          );

        // ==================================================
        // 8. สร้าง Excel
        // ==================================================

        const workbook =
          XLSX.utils.book_new();

        const jobsSheet =
          XLSX.utils.json_to_sheet(
            jobsForExcel,
          );

        const historySheet =
          XLSX.utils.json_to_sheet(
            historyForExcel,
          );

        XLSX.utils.book_append_sheet(
          workbook,
          jobsSheet,
          "Repair Jobs",
        );

        XLSX.utils.book_append_sheet(
          workbook,
          historySheet,
          "Status History",
        );

        // ==================================================
        // 9. แปลงเป็น XLSX
        // ==================================================

        const excelData =
          XLSX.write(
            workbook,
            {
              bookType: "xlsx",
              type: "array",
            },
          );

        const excelBytes =
          new Uint8Array(
            excelData,
          );

        // ==================================================
        // 10. สร้างชื่อไฟล์ไม่ให้ซ้ำ
        // ==================================================

        const now =
          new Date();

        const today =
          now
            .toISOString()
            .slice(0, 10);

        const time =
          now
            .toISOString()
            .slice(11, 19)
            .replace(
              /:/g,
              "",
            );

        const fileName =
          `MiniRepair_Archive_${today}_${time}.xlsx`;

        const storagePath =
          `${today}/${fileName}`;

        // ==================================================
        // 11. Upload Excel
        // ==================================================

        const {
          error: uploadError,
        } = await admin.storage
          .from(BUCKET_NAME)
          .upload(
            storagePath,
            excelBytes,
            {
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              upsert: false,
            },
          );

        if (uploadError) {
          throw new Error(
            `Failed to upload Excel: ${uploadError.message}`,
          );
        }

        console.log(
          "Excel upload completed:",
          storagePath,
        );

        // ==================================================
        // 12. ตรวจว่าไฟล์มีอยู่จริง
        // ==================================================

        const {
          data: fileExists,
          error: verifyError,
        } = await admin.storage
          .from(BUCKET_NAME)
          .exists(
            storagePath,
          );

        if (verifyError) {
          throw new Error(
            `Upload verification failed: ${verifyError.message}`,
          );
        }

        if (!fileExists) {
          throw new Error(
            `Upload reported success, but file was not found in storage: ${storagePath}`,
          );
        }

        console.log(
          "Verified uploaded file:",
          storagePath,
        );

        // ==================================================
        // 13. สร้าง Archive Log
        // ==================================================

        const {
          data: archiveLog,
          error: logError,
        } = await admin
          .from<ArchiveLog>(
            "archive_logs",
          )
          .insert({
            export_date:
              today,
            file_name:
              fileName,
            storage_path:
              storagePath,
            record_count:
              repairJobs.length,
            status:
              "success",
          })
          .select("*")
          .single();

        if (logError) {
          throw new Error(
            `Excel uploaded, but archive log failed: ${logError.message}`,
          );
        }

        if (!archiveLog) {
          throw new Error(
            "Archive log insert returned no data.",
          );
        }

        // ==================================================
        // 14. SAFETY GATE
        // ==================================================

        if (
          archiveLog.record_count !==
          repairJobs.length
        ) {
          throw new Error(
            `Safety check failed: archive log count (${archiveLog.record_count}) does not match selected repair jobs (${repairJobs.length}). No data was deleted.`,
          );
        }

        if (
          archiveLog.status !==
          "success"
        ) {
          throw new Error(
            "Safety check failed: archive log status is not success. No data was deleted.",
          );
        }

        console.log(
          "Safety Gate passed:",
          {
            archiveLogCount:
              archiveLog.record_count,
            selectedJobCount:
              repairJobs.length,
            storagePath:
              storagePath,
          },
        );

        // ==================================================
        // 15. DELETE Status History
        //
        // ลบ History ก่อน เพราะอาจมี Foreign Key
        // เชื่อมกับ repair_jobs
        // ==================================================

        const {
          data: deletedHistory,
          error: historyDeleteError,
        } = await admin
          .from<StatusHistory>(
            "repair_status_history",
          )
          .delete()
          .in(
            "repair_job_id",
            archiveJobIds,
          )
          .select("id");

        if (historyDeleteError) {
          throw new Error(
            `Status history delete failed. Repair jobs were NOT deleted: ${historyDeleteError.message}`,
          );
        }

        const deletedHistoryCount =
          deletedHistory?.length ?? 0;

        // ==================================================
        // 16. DELETE repair_jobs
        //
        // สำคัญ:
        // ลบเฉพาะ ID ที่ผ่าน Backup เท่านั้น
        // ==================================================

        const {
          data: deletedJobs,
          error: jobsDeleteError,
        } = await admin
          .from<RepairJob>(
            "repair_jobs",
          )
          .delete()
          .in(
            "id",
            archiveJobIds,
          )
          .select("id");

        if (jobsDeleteError) {
          throw new Error(
            `Repair jobs delete failed: ${jobsDeleteError.message}`,
          );
        }

        const deletedJobCount =
          deletedJobs?.length ?? 0;

        // ==================================================
        // 17. ตรวจจำนวนที่ถูก Delete
        // ==================================================

        if (
          deletedJobCount !==
          repairJobs.length
        ) {
          throw new Error(
            `DELETE safety verification failed: expected ${repairJobs.length} repair jobs to be deleted, but ${deletedJobCount} were deleted.`,
          );
        }

        // ==================================================
        // 18. สำเร็จ
        // ==================================================

        console.log(
          "Archive and delete completed:",
          {
            archiveJobCount:
              repairJobs.length,
            deletedJobCount:
              deletedJobCount,
            deletedHistoryCount:
              deletedHistoryCount,
            storagePath:
              storagePath,
          },
        );

        return Response.json({
          success: true,

          mode: "LIVE",

          message:
            "Archive export and delete completed successfully.",

          file_name:
            fileName,

          storage_path:
            storagePath,

          archive_cutoff_date:
            archiveCutoff,

          archive_job_count:
            repairJobs.length,

          deleted_job_count:
            deletedJobCount,

          deleted_history_count:
            deletedHistoryCount,

          deleted: true,
        });

      } catch (error) {
        // ==================================================
        // Error Handler
        // ==================================================

        console.error(
          "export-repair-archive error:",
          error,
        );

        return Response.json(
          {
            success: false,

            mode: "LIVE",

            message:
              error instanceof Error
                ? error.message
                : "Unknown error",

            deleted: false,
          },
          {
            status: 500,
          },
        );
      }
    },
  ),
};