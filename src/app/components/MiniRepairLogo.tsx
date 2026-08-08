import logo from "../assets/logo.png";

interface Props {
  size?: number;
}

export default function MiniRepairLogo({ size = 200 }: Props) {
  return (
    <img
      src={logo}
      alt="มินิซ่อม"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  );
}