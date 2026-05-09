import { useState, useEffect } from "react";
import AnimatedContent from "../ui/animatedContent";
import { getAll, update as updateApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTetMode } from "../../contexts/TetModeContext";
import { useTranslation } from "react-i18next";

const BLUE_PRIMARY = "#2563EB";

export default function MultiLanguageDef() {
  const { user } = useAuth();
  const { tetMode } = useTetMode();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAll("translations/list", true);
      const mappedData = response.data.map((item) => ({
        id: item.id,
        messageId: item.key,
        en: item.en || "",
        vi: item.vi || "",
        ko: item.kr || "",
      }));
      setRows(mappedData);
    } catch (error) {
      console.error("Failed to fetch translations:", error);
    }
  };

  const filteredRows = rows.filter(
    (r) =>
      r.messageId.toLowerCase().includes(search.toLowerCase()) ||
      r.en.toLowerCase().includes(search.toLowerCase()) ||
      r.vi.toLowerCase().includes(search.toLowerCase()) ||
      r.ko.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSelect(row) {
    setSelectedId(row.id);
    setForm({ ...row });
    setErrors({});
  }

  function validate() {
    const newErrors = {};
    if (!form?.en?.trim()) newErrors.en = t("field_required");
    if (!form?.vi?.trim()) newErrors.vi = t("field_required");
    if (!form?.ko?.trim()) newErrors.ko = t("field_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleEdit() {
    if (!form || !selectedId) return;
    if (!validate()) return;

    try {
      const payload = {
        key: form.messageId,
        en: form.en,
        vi: form.vi,
        kr: form.ko,
        event_user: user?.username || "admin",
      };
      await updateApi("translations", "update", payload, true);
      setRows((prev) => prev.map((r) => (r.id === form.id ? { ...form } : r)));
      alert(t("update_translation_success"));
    } catch (error) {
      console.error("Failed to update translation:", error);
      alert(t("update_translation_fail"));
    }
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const canEdit = selectedId !== null;

  return (
    <AnimatedContent>
      <main
        className={`shadow-[0_4px_24px_rgba(0,0,0,0.30)] overflow-hidden rounded-xl mt-[160px] sm:mt-[200px] md:mt-[220px] lg:mt-[150px] xl:mt-[100px] ${tetMode ? "border border-[#4a4b4c]" : ""}`}
      >
        <div className="flex gap-0 h-[calc(100vh-150px)]">
          {/* LEFT: Table panel */}
          <div
            className={`flex-1 flex flex-col border-r min-w-0 ${tetMode ? "bg-[#242526] border-[#4a4b4c]" : "bg-white border-gray-200"}`}
          >
            {/* Search bar */}
            <div
              className={`flex items-center gap-3 px-4 py-2.5 border-b ${tetMode ? "border-[#4a4b4c] bg-[#3a3b3c]" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search_translation_placeholder")}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 transition-colors ${
                    tetMode
                      ? "bg-[#242526] border-[#4a4b4c] text-white placeholder-gray-500 focus:border-[#CB0502] focus:ring-red-900/30"
                      : "bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr
                    className={`sticky top-0 z-10 border-b-2 ${tetMode ? "bg-[#3a3b3c] border-[#4a4b4c]" : "bg-white border-gray-300"}`}
                  >
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r w-12 ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "text-gray-700 border-gray-200"}`}
                    >
                      Number
                    </th>
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "text-gray-700 border-gray-200"}`}
                    >
                      Message ID
                    </th>
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "text-gray-700 border-gray-200"}`}
                    >
                      EN
                    </th>
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "text-gray-700 border-gray-200"}`}
                    >
                      VI
                    </th>
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "text-gray-700 border-gray-200"}`}
                    >
                      KO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => {
                    const isSelected = row.id === selectedId;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => handleSelect(row)}
                        className={`cursor-pointer transition-colors border-b
                        ${tetMode ? "border-[#4a4b4c]" : "border-gray-200"}
                        ${
                          isSelected
                            ? tetMode
                              ? "bg-[#3a3b3c]"
                              : "bg-blue-50"
                            : idx % 2 === 0
                              ? tetMode
                                ? "bg-[#242526] hover:bg-[#3a3b3c]"
                                : "bg-white hover:bg-gray-50"
                              : tetMode
                                ? "bg-[#2a2b2c] hover:bg-[#3a3b3c]"
                                : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        style={{
                          borderLeft: isSelected
                            ? tetMode
                              ? "3px solid #CB0502"
                              : "3px solid #2563eb"
                            : "3px solid transparent",
                        }}
                      >
                        <td
                          className={`px-4 py-3 text-center border-r ${tetMode ? "text-gray-400 border-[#4a4b4c]" : "text-gray-500 border-gray-200"}`}
                        >
                          {idx + 1}
                        </td>
                        <td
                          className={`px-4 py-3 font-medium border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "text-gray-800 border-gray-200"}`}
                        >
                          {row.messageId}
                        </td>
                        <td
                          className={`px-4 py-3 border-r ${tetMode ? "text-gray-300 border-[#4a4b4c]" : "text-gray-700 border-gray-200"}`}
                        >
                          {row.en}
                        </td>
                        <td
                          className={`px-4 py-3 border-r ${tetMode ? "text-gray-300 border-[#4a4b4c]" : "text-gray-700 border-gray-200"}`}
                        >
                          {row.vi}
                        </td>
                        <td
                          className={`px-4 py-3 border-r ${tetMode ? "text-gray-300 border-[#4a4b4c]" : "text-gray-600 border-gray-200"}`}
                        >
                          {row.ko}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className={`text-center py-10 italic ${tetMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {t("no_data")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Editor panel */}
          <div
            className={`w-80 flex flex-col shrink-0 ${tetMode ? "bg-[#2a2b2c]" : "bg-white"}`}
          >
            {/* Editor header */}
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-b ${tetMode ? "border-[#4a4b4c] bg-[#3a3b3c]" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: tetMode ? "#CB0502" : BLUE_PRIMARY }}
                />
                <span
                  className={`font-semibold text-xs ${tetMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  {t("information")}
                </span>
              </div>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-auto px-4 py-4">
              {form === null ? (
                <div
                  className={`flex flex-col items-center justify-center h-full gap-3 ${tetMode ? "text-gray-500" : "text-gray-300"}`}
                >
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-xs italic">
                    {t("select_row_to_view_detail")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Message ID — không cho sửa */}
                  <FormField
                    label="Message ID"
                    value={form?.messageId || ""}
                    disabled
                    required
                    tetMode={tetMode}
                  />
                  <FormField
                    label="Message_EN"
                    value={form?.en || ""}
                    onChange={(v) => handleFormChange("en", v)}
                    error={errors.en}
                    required
                    tetMode={tetMode}
                  />
                  <FormField
                    label="Message_VI"
                    value={form?.vi || ""}
                    onChange={(v) => handleFormChange("vi", v)}
                    error={errors.vi}
                    required
                    tetMode={tetMode}
                  />
                  <FormField
                    label="Message_KO"
                    value={form?.ko || ""}
                    onChange={(v) => handleFormChange("ko", v)}
                    error={errors.ko}
                    required
                    tetMode={tetMode}
                  />

                  {/* Nút Edit / cập nhật */}
                  <button
                    onClick={handleEdit}
                    disabled={!canEdit}
                    className={`mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded text-xs font-semibold transition
                      ${
                        canEdit
                          ? tetMode
                            ? "bg-[#CB0502] text-white hover:bg-red-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                          : tetMode
                            ? "bg-[#3a3b3c] text-gray-500 cursor-not-allowed"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {t("edit")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AnimatedContent>
  );
}

function FormField({
  label,
  value,
  onChange,
  disabled,
  required,
  error,
  tetMode,
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className={`flex items-center gap-1 text-xs font-semibold ${tetMode ? "text-gray-300" : "text-gray-600"}`}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-2.5 py-1.5 text-xs border rounded transition
          ${
            disabled
              ? tetMode
                ? "bg-[#3a3b3c] border-[#4a4b4c] text-gray-500 cursor-default"
                : "bg-gray-100 border-gray-200 text-gray-500 cursor-default"
              : error
                ? tetMode
                  ? "bg-[#242526] border-red-500 text-white focus:outline-none focus:ring-1 focus:ring-red-900/30"
                  : "bg-white border-red-400 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                : tetMode
                  ? "bg-[#242526] border-[#4a4b4c] text-white focus:outline-none focus:border-[#CB0502] focus:ring-1 focus:ring-red-900/30"
                  : "bg-white border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          }`}
      />
      {error && (
        <span className="text-red-500 text-[10px] mt-0.5">{error}</span>
      )}
    </div>
  );
}
