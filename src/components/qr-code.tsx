import { QRCodeSVG } from "qrcode.react";

interface QrCodeProps {
	value: string;
	size?: number;
	className?: string;
}

export function QrCode({ value, size = 180, className }: QrCodeProps) {
	return (
		<div className={`inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-md ${className ?? ""}`}>
			<QRCodeSVG value={value} size={size} level="M" bgColor="#ffffff" fgColor="#09090b" marginSize={1} />
		</div>
	);
}
