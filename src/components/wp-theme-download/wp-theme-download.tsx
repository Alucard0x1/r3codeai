import { FaWordpress } from "react-icons/fa";
import { HiDownload, HiX } from "react-icons/hi";

interface WPThemeData {
  filename: string;
  downloadUrl: string;
  createdAt: Date;
  themeInfo: {
    name: string;
    description: string;
    version: string;
  };
}

interface WPThemeDownloadProps {
  themeData: WPThemeData;
  onDownload: () => void;
  onDismiss: () => void;
}

function WPThemeDownload({ 
  themeData, 
  onDownload, 
  onDismiss 
}: WPThemeDownloadProps) {
  return (
    <div className="wp-theme-download-banner">
      <div className="container-fluid px-3 px-lg-4">
        <div className="wp-download-content">
          <div className="wp-theme-info">
            <div className="wp-theme-icon">
              <FaWordpress size={24} />
            </div>
            <div className="wp-theme-details">
              <h4 className="wp-theme-title">{themeData.themeInfo.name}</h4>
              <p className="wp-theme-desc">
                WordPress theme ready for download • {themeData.themeInfo.version}
              </p>
            </div>
          </div>
          
          <div className="wp-download-actions">
            <button 
              className="wp-download-btn"
              onClick={onDownload}
            >
              <HiDownload className="me-2" size={16} />
              Download ZIP
            </button>
            <button 
              className="wp-dismiss-btn"
              onClick={onDismiss}
              title="Dismiss"
            >
              <HiX size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WPThemeDownload;
