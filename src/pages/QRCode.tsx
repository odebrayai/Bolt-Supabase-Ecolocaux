import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';

export default function QRCodePage() {
  const appUrl = 'https://ecolocaux-olivier.bolt.host';

  const handleDownload = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1024;
    canvas.height = 1024;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'eco-locaux-qrcode.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Eco-Locaux CRM',
          text: 'Accédez à l\'application Eco-Locaux',
          url: appUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(appUrl);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-[#12121a] rounded-2xl border border-[#1e293b] p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#f1f5f9] mb-3">
              QR Code Eco-Locaux
            </h1>
            <p className="text-[#94a3b8] text-lg">
              Scannez pour accéder au CRM
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <QRCodeSVG
                id="qr-code"
                value={appUrl}
                size={320}
                level="H"
                includeMargin={true}
                fgColor="#0a0a0f"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-[#94a3b8] font-mono break-all">
              {appUrl}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 font-semibold flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Télécharger PNG
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-[#f1f5f9] rounded-lg hover:bg-slate-700 transition-all duration-200 font-semibold flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Partager
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-[#1e293b]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#f1f5f9] mb-2">
                  Pour la présentation
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  Affichez ce QR code sur grand écran ou imprimez-le pour votre démonstration
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#f1f5f9] mb-2">
                  Accès instantané
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  Les participants peuvent scanner le code avec leur smartphone pour accéder directement à l'application
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#94a3b8]">
            Astuce : Utilisez le mode plein écran (F11) pour une présentation optimale
          </p>
        </div>
      </div>
    </div>
  );
}
