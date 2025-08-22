import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function ConfirmDialog({
  open,
  setOpen,
  onConfirm,
  title,
  message,
  icon,
}) {
  const { t, i18n } = useTranslation();
  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return (
    <div className={clsx("relative z-10", open ? "visible" : "invisible")}>
      <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          onClick={() => setOpen(false)}
          className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 max-sm:items-center"
        >
          <div
            className={clsx(
              "relative overflow-hidden rounded-lg text-left shadow-xl fade-slide-up sm:my-8 sm:w-full sm:max-w-lg",
              open ? "fade-slide-up-visible" : "fade-slide-up-hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                  {icon}
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold text-gray-900">
                    {title || "Are you sure?"}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {message || "This action cannot be undone."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => {
                  onConfirm?.();
                  setOpen(false);
                }}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
              >
                {t("excute")}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {t("cancle")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
