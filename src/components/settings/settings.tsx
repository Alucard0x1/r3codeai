import classNames from "classnames";
import { PiGearSixFill } from "react-icons/pi";

function Settings({
  open,
  onClose,
}: {
  open: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="">
      <button
        className="relative overflow-hidden cursor-pointer flex-none flex items-center justify-center rounded-full text-base font-semibold size-8 text-center bg-gray-800 hover:bg-gray-700 text-gray-100 shadow-sm dark:shadow-highlight/20"
        onClick={() => {
          onClose((prev) => !prev);
        }}
      >
        <PiGearSixFill />
      </button>
      <div
        className={classNames(
          "h-screen w-screen bg-black/20 fixed left-0 top-0 z-40",
          {
            "opacity-0 pointer-events-none": !open,
          }
        )}
        onClick={() => onClose(false)}
      ></div>
      <div
        className={classNames(
          "absolute top-0 -translate-y-[calc(100%+16px)] right-0 z-40 w-96 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-75 overflow-hidden",
          {
            "opacity-0 pointer-events-none": !open,
          }
        )}
      >
        <header className="flex items-center text-sm px-4 py-2 border-b border-gray-200 gap-2 bg-gray-100 font-semibold text-gray-700">
          <span className="text-xs bg-blue-500/10 text-blue-500 rounded-full pl-1.5 pr-2.5 py-0.5 flex items-center justify-start gap-1.5">
            AI
          </span>
          AI Settings
        </header>
        <main className="px-4 pt-3 pb-4 space-y-4">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Powered by Google Gemini
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Using Google's Gemini 2.0 Flash model via REST API for fast and intelligent responses.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong>Rate Limited:</strong> 10 requests per hour per IP address. Add your Gemini API key to the .env file for unlimited usage.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default Settings;
