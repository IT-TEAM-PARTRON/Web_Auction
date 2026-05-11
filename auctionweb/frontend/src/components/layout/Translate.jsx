import { useState, useEffect } from "react";
import AnimatedContent from "../ui/animatedContent";
import { getAll, update as updateApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTetMode } from "../../contexts/TetModeContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { forceReloadI18n } from "../../i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileImport,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
        messageId: item.description,
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleEdit() {
    if (!form || !selectedId) return;
    if (!validate()) return;

    const originalRow = rows.find((r) => r.id === selectedId);
    if (
      originalRow &&
      form.en === originalRow.en &&
      form.vi === originalRow.vi &&
      form.ko === originalRow.ko
    ) {
      toast.error(t("no_changes_update", "No changes detected to update."));
      return;
    }

    try {
      const payload = {
        description: form.messageId,
        en: form.en,
        vi: form.vi,
        kr: form.ko,
        event_user: user?.username || "admin",
      };
      await updateApi("translations", "update", payload, true);
      setRows((prev) => prev.map((r) => (r.id === form.id ? { ...form } : r)));
      await forceReloadI18n();
      toast.success(t("update_translation_success"));
    } catch (error) {
      console.error("Failed to update translation:", error);
      toast.error(t("update_translation_fail"));
    }
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const handleExport = () => {
    const data = rows.map(row => ({
      id: row.id || "",
      description: row.messageId || "",
      vi: row.vi || "",
      en: row.en || "",
      kr: row.ko || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Translations");
    
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    
    saveAs(dataBlob, "translations.xlsx");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();
  const validMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  if (
    !validExtensions.includes(fileExtension) ||
    !validMimeTypes.includes(file.type)
  ) {
    toast.error(
      t(
        "invalid_file_type",
        "Only .xlsx, .xls, .csv Excel files are allowed."
      )
    );

    e.target.value = null;
    return;
  }
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (!json || json.length === 0) {
                    toast.error(t("invalid_excel", "Invalid Excel file or empty data."));
                    e.target.value = null;
                    return;
                }
                const normalizedJson = json.map(row => {
                    const normalized = {};
                    for (const key in row) {
                        normalized[key.trim().toLowerCase()] = row[key];
                    }
                    return normalized;
                });

                const firstRow = normalizedJson[0];
                if (!("id" in firstRow) || !("description" in firstRow) || !("vi" in firstRow) || !("en" in firstRow) || !("kr" in firstRow)) {
                    toast.error(t("invalid_excel_format", "Excel format is invalid. Required columns: id, description, vi, en, kr"));
                    e.target.value = null;
                    return;
                }

                const translationsPayload = [];
                for (const row of normalizedJson) {
                    const description = row.description?.toString().trim();
                    if (!description) continue;

                    translationsPayload.push({
                        description: description,
                        vi: row.vi?.toString() || "",
                        en: row.en?.toString() || "",
                        kr: row.kr?.toString() || "",
                        event_user: user?.username || "admin"
                    });
                }

                if (translationsPayload.length === 0) {
                    toast.error(t("no_valid_data", "No valid data found to import."));
                    e.target.value = null;
                    return;
                }
                try {
                    const payload = { translations: translationsPayload };
                    const res = await updateApi("translations", "bulk-update", payload, true);
                    toast.success(res?.data?.message || t("import_success", "Import successful!"));
                    fetchData();
                    await forceReloadI18n();
                } catch (apiError) {
                    console.error("Bulk update error:", apiError);
                    toast.error(apiError?.response?.data?.detail || t("import_fail", "Import failed!"));
                }
            } catch (err) {
                console.error("Excel parse error:", err);
                toast.error(t("parse_error", "Error parsing Excel file."));
            }
            e.target.value = null;
        };
        reader.readAsArrayBuffer(file);
    } catch (err) {
        console.error("File read error:", err);
        toast.error(t("read_error", "Error reading file."));
        e.target.value = null;
    }
  };

  const canEdit = selectedId !== null;

  return (
    <AnimatedContent>
      <main
        className={`shadow-[0_4px_24px_rgba(0,0,0,0.30)] overflow-hidden rounded-xl mt-[160px] sm:mt-[200px] md:mt-[220px] lg:mt-[150px] xl:mt-[100px] ${tetMode ? "border border-[#4a4b4c]" : ""}`}
      >
        <div className="flex flex-col lg:flex-row gap-0 h-auto lg:h-[calc(100vh-150px)]">
          {/* LEFT: Table panel */}
          <div
            className={`order-2 lg:order-1 flex-1 flex flex-col min-h-[500px] lg:min-h-0 border-b lg:border-b-0 lg:border-r min-w-0 ${tetMode ? "bg-[#242526] border-[#4a4b4c]" : "bg-white border-gray-200"}`}
          >
            {/* Header: Title, Search bar, and Actions */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:py-2.5 border-b ${tetMode ? "border-[#4a4b4c] bg-[#3a3b3c]" : "border-gray-200 bg-gray-50"}`}
            >
              {/* Title & Search Container */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <span
                  className={`font-semibold text-xl whitespace-nowrap ${tetMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  {t("list_translations")}
                </span>
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("search_translation_placeholder")}
                    className={`w-full pl-2 pr-8 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 transition-colors ${
                      tetMode
                        ? "bg-[#242526] border-[#4a4b4c] text-white placeholder-gray-500 focus:border-[#CB0502] focus:ring-red-900/30"
                        : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500"
                    }`}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${
                        tetMode ? "hover:text-gray-200" : "hover:text-gray-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <input
                  type="file"
                  id="import-csv"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleImport}
                />
                <button
                  onClick={() => document.getElementById("import-csv").click()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    tetMode
                      ? "bg-[#3a3b3c] hover:bg-[#4a4b4c] text-gray-200 border border-[#4a4b4c]"
                      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
                  }`}
                >
                  <FontAwesomeIcon icon={faFileImport} />
                  {t("import_btn", "Import")}
                </button>
                <button
                  onClick={handleExport}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm ${
                    tetMode
                      ? "bg-[#CB0502] hover:bg-red-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faFileExport} />
                  {t("export_btn", "Export")}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr
                    className={`sticky top-0 z-10 border-b-2 ${tetMode ? "bg-[#3a3b3c] border-[#4a4b4c]" : "bg-gray-200 border-gray-200"}`}
                  >
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r w-12 ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "border-gray-200"}`}
                    >
                      {t("number_col", "#")}
                    </th>
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "border-gray-200"}`}
                    >
                      {t("description_col", "Description")}
                    </th>
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "border-gray-200"}`}
                    >
                     {t("en_col", "EN")}
                    </th>
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "border-gray-200"}`}
                    >
                     {t("vi_col", "VI")}
                    </th>
                    <th
                      className={`px-4 py-3 text-center font-bold uppercase tracking-wide border-r ${tetMode ? "text-gray-200 border-[#4a4b4c]" : "border-gray-200"}`}
                    >
                     {t("ko_col", "KO")}
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
                        className={`cursor-pointer transition border-b
                        ${tetMode ? "border-[#4a4b4c]" : "border-gray-200"}
                        ${
                          isSelected
                            ? tetMode
                              ? "bg-[#CB0502] text-white"
                              : "bg-blue-400 text-white"
                            : tetMode
                              ? "text-gray-300 hover:bg-[#CB0502] hover:text-white"
                              : "hover:bg-blue-400 hover:text-white"
                        }`}
                      >
                        <td
                          className={`px-4 py-3 text-center border-r ${tetMode ? "border-[#4a4b4c]" : "border-gray-200"}`}
                        >
                          {idx + 1}
                        </td>
                        <td
                          className={`px-4 py-3 font-medium border-r ${tetMode ? "border-[#4a4b4c]" : "border-gray-200"}`}
                        >
                          {row.messageId}
                        </td>
                        <td
                          className={`px-4 py-3 border-r ${tetMode ? "border-[#4a4b4c]" : "border-gray-200"}`}
                        >
                          {row.en}
                        </td>
                        <td
                          className={`px-4 py-3 border-r ${tetMode ? "border-[#4a4b4c]" : "border-gray-200"}`}
                        >
                          {row.vi}
                        </td>
                        <td
                          className={`px-4 py-3 border-r ${tetMode ? "border-[#4a4b4c]" : "border-gray-200"}`}
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
            className={`order-1 lg:order-2 w-full lg:w-80 flex flex-col shrink-0 ${tetMode ? "bg-[#2a2b2c]" : "bg-white"}`}
          >
            {/* Editor header */}
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-b ${tetMode ? "border-[#4a4b4c] bg-[#3a3b3c]" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold text-xl ${tetMode ? "text-gray-200" : "text-gray-700"}`}
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
                    label={t("description_col", "Description")}
                    value={form?.messageId || ""}
                    disabled
                    required
                    tetMode={tetMode}
                  />
                  <FormField
                    label={t("en_col", "EN")}
                    value={form?.en || ""}
                    onChange={(v) => handleFormChange("en", v)}
                    error={errors.en}
                    required
                    tetMode={tetMode}
                  />
                  <FormField
                    label={t("vi_col", "VI")}
                    value={form?.vi || ""}
                    onChange={(v) => handleFormChange("vi", v)}
                    error={errors.vi}
                    required
                    tetMode={tetMode}
                  />
                  <FormField
                    label={t("ko_col", "KO")}
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
