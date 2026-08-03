package com.smartwms.service;

import com.smartwms.dto.response.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Generates professional Excel (XLSX) reports for all 5 report types.
 * Uses Apache POI for Excel generation.
 */
@Service
@Slf4j
public class ExcelExportService {

    // ─── Brand Colors ───────────────────────────────────────
    private static final byte[] BLUE_RGB   = {(byte) 59, (byte) 130, (byte) 246};
    private static final byte[] DARK_RGB   = {(byte) 30, (byte) 41, (byte) 59};
    private static final byte[] WHITE_RGB  = {(byte) 255, (byte) 255, (byte) 255};
    private static final byte[] LIGHT_RGB  = {(byte) 241, (byte) 245, (byte) 249};
    private static final byte[] ALT_RGB    = {(byte) 248, (byte) 250, (byte) 252};
    private static final byte[] GRAY_RGB   = {(byte) 100, (byte) 116, (byte) 139};

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ═══════════════════════════════════════════════════════════
    //  PUBLIC API — 5 export methods
    // ═══════════════════════════════════════════════════════════

    public byte[] exportInventoryReport(InventoryReportResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet summary = wb.createSheet("Overview");
            writeTitleRow(summary, "Inventory Report", "Stock levels, movements, and alerts");

            int row = 2;
            row = writeStatCards(summary, row, new String[][]{
                    {"Total Products", str(data.getTotalProducts())},
                    {"Total Stock", str(data.getTotalStockQuantity())},
                    {"Inventory Value", currency(data.getTotalInventoryValue())},
                    {"Avg Price", currency(data.getAverageSellingPrice())},
                    {"Low Stock", str(data.getLowStockCount())},
                    {"Out of Stock", str(data.getOutOfStockCount())},
                    {"Active", str(data.getActiveProducts())},
                    {"Inactive", str(data.getInactiveProducts())},
            });

            if (data.getCategoryBreakdown() != null && !data.getCategoryBreakdown().isEmpty()) {
                row += 2;
                XSSFSheet catSheet = wb.createSheet("Categories");
                XSSFRow hdr = catSheet.createRow(0);
                writeHeaders(hdr, catSheet, "Category", "Products", "Stock", "Value (₹)");
                int r = 1;
                for (InventoryReportResponse.CategoryStockEntry e : data.getCategoryBreakdown()) {
                    XSSFRow cr = catSheet.createRow(r++);
                    writeCells(cr, e.getCategoryName(), str(e.getProductCount()), str(e.getTotalStock()), currency(e.getTotalValue()));
                }
                addTotalsRow(catSheet, r, "Total", str(data.getCategoryBreakdown().stream().mapToLong(InventoryReportResponse.CategoryStockEntry::getProductCount).sum()),
                        str(data.getCategoryBreakdown().stream().mapToLong(InventoryReportResponse.CategoryStockEntry::getTotalStock).sum()), "—");
                autoSize(catSheet, 4);
            }

            if (data.getWarehouseBreakdown() != null && !data.getWarehouseBreakdown().isEmpty()) {
                row += 2;
                XSSFSheet whSheet = wb.createSheet("Warehouses");
                XSSFRow hdr = whSheet.createRow(0);
                writeHeaders(hdr, whSheet, "Warehouse", "Products", "Stock", "Utilization");
                int r = 1;
                for (InventoryReportResponse.WarehouseStockEntry e : data.getWarehouseBreakdown()) {
                    XSSFRow cr = whSheet.createRow(r++);
                    writeCells(cr, e.getWarehouseName(), str(e.getProductCount()), str(e.getTotalStock()), pct(e.getCapacityUtilization()));
                }
                autoSize(whSheet, 4);
            }

            if (data.getTopProductsByValue() != null && !data.getTopProductsByValue().isEmpty()) {
                XSSFSheet topSheet = wb.createSheet("Top Products");
                XSSFRow hdr = topSheet.createRow(0);
                writeHeaders(hdr, topSheet, "Product", "SKU", "Stock", "Price (₹)", "Value (₹)");
                int r = 1;
                for (InventoryReportResponse.ProductStockEntry e : data.getTopProductsByValue()) {
                    XSSFRow cr = topSheet.createRow(r++);
                    writeCells(cr, e.getName(), e.getSku(), str(e.getCurrentStock()), currency(e.getSellingPrice()), currency(e.getStockValue()));
                }
                autoSize(topSheet, 5);
            }

            if (data.getReorderAlerts() != null && !data.getReorderAlerts().isEmpty()) {
                XSSFSheet alertSheet = wb.createSheet("Reorder Alerts");
                XSSFRow hdr = alertSheet.createRow(0);
                writeHeaders(hdr, alertSheet, "Product", "SKU", "Stock", "Reorder Level");
                int r = 1;
                for (InventoryReportResponse.ProductStockEntry e : data.getReorderAlerts()) {
                    XSSFRow cr = alertSheet.createRow(r++);
                    writeCells(cr, e.getName(), e.getSku(), str(e.getCurrentStock()), str(e.getReorderLevel()));
                }
                autoSize(alertSheet, 4);
            }

            autoSize(summary, 4);
            return toBytes(wb);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Inventory Excel", e);
        }
    }

    public byte[] exportProductReport(ProductReportResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet summary = wb.createSheet("Overview");
            writeTitleRow(summary, "Product Report", "Catalog analytics and breakdowns");

            ProductReportResponse.ProductStatistics s = data.getStatistics();
            if (s != null) {
                writeStatCards(summary, 2, new String[][]{
                        {"Total Products", str(s.getTotalProducts())},
                        {"Total Stock", str(s.getTotalStockQuantity())},
                        {"Stock Value", currency(s.getTotalStockValue())},
                        {"Avg Price", currency(s.getAveragePrice())},
                        {"Low Stock", str(s.getLowStockCount())},
                        {"Out of Stock", str(s.getOutOfStockCount())},
                        {"Categories", str(s.getCategoryCount())},
                        {"Suppliers", str(s.getSupplierCount())},
                });
            }

            if (data.getCategoryBreakdown() != null && !data.getCategoryBreakdown().isEmpty()) {
                XSSFSheet catSheet = wb.createSheet("Categories");
                XSSFRow hdr = catSheet.createRow(0);
                writeHeaders(hdr, catSheet, "Category", "Products", "Stock", "Value (₹)");
                int r = 1;
                for (ProductReportResponse.CategoryProductEntry e : data.getCategoryBreakdown()) {
                    XSSFRow cr = catSheet.createRow(r++);
                    writeCells(cr, e.getCategoryName(), str(e.getProductCount()), str(e.getTotalStock()), currency(e.getTotalValue()));
                }
                autoSize(catSheet, 4);
            }

            if (data.getSupplierBreakdown() != null && !data.getSupplierBreakdown().isEmpty()) {
                XSSFSheet supSheet = wb.createSheet("Suppliers");
                XSSFRow hdr = supSheet.createRow(0);
                writeHeaders(hdr, supSheet, "Supplier", "Products", "Stock", "Value (₹)");
                int r = 1;
                for (ProductReportResponse.SupplierProductEntry e : data.getSupplierBreakdown()) {
                    XSSFRow cr = supSheet.createRow(r++);
                    writeCells(cr, e.getSupplierName(), str(e.getProductCount()), str(e.getTotalStock()), currency(e.getTotalValue()));
                }
                autoSize(supSheet, 4);
            }

            if (data.getProducts() != null && data.getProducts().getItems() != null && !data.getProducts().getItems().isEmpty()) {
                XSSFSheet prodSheet = wb.createSheet("Products");
                XSSFRow hdr = prodSheet.createRow(0);
                writeHeaders(hdr, prodSheet, "Name", "SKU", "Category", "Stock", "Price (₹)", "Status");
                int r = 1;
                for (ProductReportResponse.ProductEntry e : data.getProducts().getItems()) {
                    XSSFRow cr = prodSheet.createRow(r++);
                    writeCells(cr, e.getName(), e.getSku(), e.getCategoryName(), str(e.getCurrentStock()), currency(e.getSellingPrice()), e.getStatus());
                }
                autoSize(prodSheet, 6);
            }

            autoSize(summary, 4);
            return toBytes(wb);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Product Excel", e);
        }
    }

    public byte[] exportWarehouseReport(WarehouseReportResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet summary = wb.createSheet("Overview");
            writeTitleRow(summary, "Warehouse Report", "Capacity and utilization metrics");

            WarehouseReportResponse.WarehouseStatistics s = data.getStatistics();
            if (s != null) {
                writeStatCards(summary, 2, new String[][]{
                        {"Total Warehouses", str(s.getTotalWarehouses())},
                        {"Active", str(s.getActiveWarehouses())},
                        {"Utilization", pct(s.getUtilizationPercentage())},
                        {"Inventory Value", currency(s.getTotalInventoryValue())},
                        {"Total Products", str(s.getTotalProducts())},
                        {"Total Stock", str(s.getTotalStockQuantity())},
                        {"Near Capacity (≥90%)", str(s.getNearCapacityCount())},
                        {"Full Capacity", str(s.getFullCapacityCount())},
                });
            }

            if (data.getWarehouses() != null && !data.getWarehouses().isEmpty()) {
                XSSFSheet whSheet = wb.createSheet("Warehouses");
                XSSFRow hdr = whSheet.createRow(0);
                writeHeaders(hdr, whSheet, "Warehouse", "Code", "Products", "Stock", "Value (₹)", "Utilization", "Status");
                int r = 1;
                for (WarehouseReportResponse.WarehouseEntry e : data.getWarehouses()) {
                    XSSFRow cr = whSheet.createRow(r++);
                    writeCells(cr, e.getName(), e.getCode(), str(e.getProductCount()), str(e.getTotalStock()),
                            currency(e.getInventoryValue()), pct(e.getUtilizationPercent()), e.getStatus());
                }
                autoSize(whSheet, 7);
            }

            if (data.getValueBreakdown() != null && !data.getValueBreakdown().isEmpty()) {
                XSSFSheet valSheet = wb.createSheet("Inventory Value");
                XSSFRow hdr = valSheet.createRow(0);
                writeHeaders(hdr, valSheet, "Warehouse", "Products", "Stock", "Inventory Value (₹)", "Purchase Value (₹)");
                int r = 1;
                for (WarehouseReportResponse.WarehouseValueEntry e : data.getValueBreakdown()) {
                    XSSFRow cr = valSheet.createRow(r++);
                    writeCells(cr, e.getName(), str(e.getProductCount()), str(e.getTotalStock()),
                            currency(e.getInventoryValue()), currency(e.getPurchaseValue()));
                }
                autoSize(valSheet, 5);
            }

            if (data.getOrdersPerWarehouse() != null && !data.getOrdersPerWarehouse().isEmpty()) {
                XSSFSheet poSheet = wb.createSheet("Purchase Orders");
                XSSFRow hdr = poSheet.createRow(0);
                writeHeaders(hdr, poSheet, "Warehouse", "Orders", "Active", "Value (₹)");
                int r = 1;
                for (WarehouseReportResponse.WarehousePOCount e : data.getOrdersPerWarehouse()) {
                    XSSFRow cr = poSheet.createRow(r++);
                    writeCells(cr, e.getWarehouseName(), str(e.getOrderCount()), str(e.getActiveOrders()), currency(e.getTotalValue()));
                }
                autoSize(poSheet, 4);
            }

            autoSize(summary, 4);
            return toBytes(wb);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Warehouse Excel", e);
        }
    }

    public byte[] exportSupplierReport(SupplierReportResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet summary = wb.createSheet("Overview");
            writeTitleRow(summary, "Supplier Report", "Supplier performance and procurement analytics");

            SupplierReportResponse.SupplierStatistics s = data.getStatistics();
            if (s != null) {
                writeStatCards(summary, 2, new String[][]{
                        {"Total Suppliers", str(s.getTotalSuppliers())},
                        {"Active", str(s.getActiveSuppliers())},
                        {"Avg Rating", s.getAverageRating() != null ? String.format("%.1f", s.getAverageRating()) : "—"},
                        {"Total Spend", currency(s.getTotalProcurementValue())},
                        {"Total Orders", str(s.getTotalOrders())},
                        {"Regions", str(s.getRegionCount())},
                });
            }

            if (data.getSuppliers() != null && data.getSuppliers().getItems() != null && !data.getSuppliers().getItems().isEmpty()) {
                XSSFSheet supSheet = wb.createSheet("Suppliers");
                XSSFRow hdr = supSheet.createRow(0);
                writeHeaders(hdr, supSheet, "Supplier", "Code", "Contact", "Products", "Orders", "Rating");
                int r = 1;
                for (SupplierReportResponse.SupplierEntry e : data.getSuppliers().getItems()) {
                    XSSFRow cr = supSheet.createRow(r++);
                    writeCells(cr, e.getName(), e.getCode(), e.getContactPerson(), str(e.getProductCount()),
                            str(e.getOrderCount()), e.getRating() != null ? String.format("%.1f", e.getRating()) : "—");
                }
                autoSize(supSheet, 6);
            }

            if (data.getTopSuppliersByValue() != null && !data.getTopSuppliersByValue().isEmpty()) {
                XSSFSheet topSheet = wb.createSheet("Top by Value");
                XSSFRow hdr = topSheet.createRow(0);
                writeHeaders(hdr, topSheet, "Supplier", "Company", "Orders", "Rating", "Total Value (₹)");
                int r = 1;
                for (SupplierReportResponse.SupplierValueEntry e : data.getTopSuppliersByValue()) {
                    XSSFRow cr = topSheet.createRow(r++);
                    writeCells(cr, e.getName(), e.getCompanyName(), str(e.getOrderCount()),
                            e.getRating() != null ? String.format("%.1f", e.getRating()) : "—", currency(e.getTotalOrderValue()));
                }
                autoSize(topSheet, 5);
            }

            if (data.getRegionBreakdown() != null && !data.getRegionBreakdown().isEmpty()) {
                XSSFSheet regSheet = wb.createSheet("Regions");
                XSSFRow hdr = regSheet.createRow(0);
                writeHeaders(hdr, regSheet, "Region", "Count", "Total Value (₹)");
                int r = 1;
                for (SupplierReportResponse.RegionCount e : data.getRegionBreakdown()) {
                    XSSFRow cr = regSheet.createRow(r++);
                    writeCells(cr, e.getRegion(), str(e.getCount()), currency(e.getTotalValue()));
                }
                autoSize(regSheet, 3);
            }

            autoSize(summary, 4);
            return toBytes(wb);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Supplier Excel", e);
        }
    }

    public byte[] exportPurchaseReport(PurchaseReportResponse data) {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet summary = wb.createSheet("Overview");
            writeTitleRow(summary, "Purchase Report", "Purchase orders and spending trends");

            PurchaseReportResponse.PurchaseStatistics s = data.getStatistics();
            long totalOrders = s != null ? s.getTotalOrders() : data.getTotalOrders();
            BigDecimal totalValue = s != null ? s.getTotalValue() : data.getTotalValue();
            long activeCount = s != null ? s.getActiveCount() : data.getActiveCount();
            long completedCount = s != null ? s.getCompletedCount() : data.getCompletedCount();

            writeStatCards(summary, 2, new String[][]{
                    {"Total Orders", str(totalOrders)},
                    {"Total Value", currency(totalValue)},
                    {"Active", str(activeCount)},
                    {"Completed", str(completedCount)},
                    {"Pending", str(s != null ? s.getPendingCount() : data.getPendingCount())},
                    {"Cancelled", str(s != null ? s.getCancelledCount() : data.getCancelledCount())},
                    {"Unique Suppliers", str(s != null ? s.getUniqueSuppliers() : 0)},
                    {"Unique Warehouses", str(s != null ? s.getUniqueWarehouses() : 0)},
            });

            if (data.getStatusBreakdown() != null && !data.getStatusBreakdown().isEmpty()) {
                XSSFSheet statusSheet = wb.createSheet("Status Breakdown");
                XSSFRow hdr = statusSheet.createRow(0);
                writeHeaders(hdr, statusSheet, "Status", "Count", "Value (₹)");
                int r = 1;
                for (PurchaseReportResponse.StatusValueEntry e : data.getStatusBreakdown()) {
                    XSSFRow cr = statusSheet.createRow(r++);
                    writeCells(cr, e.getStatus(), str(e.getCount()), currency(e.getTotalValue()));
                }
                autoSize(statusSheet, 3);
            }

            if (data.getTopSuppliers() != null && !data.getTopSuppliers().isEmpty()) {
                XSSFSheet supSheet = wb.createSheet("Top Suppliers");
                XSSFRow hdr = supSheet.createRow(0);
                writeHeaders(hdr, supSheet, "Supplier", "Orders", "Completed", "Value (₹)");
                int r = 1;
                for (PurchaseReportResponse.SupplierOrderEntry e : data.getTopSuppliers()) {
                    XSSFRow cr = supSheet.createRow(r++);
                    writeCells(cr, e.getSupplierName(), str(e.getOrderCount()), str(e.getCompletedCount()), currency(e.getTotalValue()));
                }
                autoSize(supSheet, 4);
            }

            if (data.getOrders() != null && data.getOrders().getItems() != null && !data.getOrders().getItems().isEmpty()) {
                XSSFSheet orderSheet = wb.createSheet("Orders");
                XSSFRow hdr = orderSheet.createRow(0);
                writeHeaders(hdr, orderSheet, "Order #", "Supplier", "Warehouse", "Date", "Amount (₹)", "Status");
                int r = 1;
                for (PurchaseReportResponse.OrderSummaryEntry e : data.getOrders().getItems()) {
                    XSSFRow cr = orderSheet.createRow(r++);
                    writeCells(cr, e.getOrderNumber(), e.getSupplierName(),
                            e.getWarehouseName() != null ? e.getWarehouseName() : "—",
                            e.getOrderDate() != null ? e.getOrderDate().toString() : "—",
                            currency(e.getTotalAmount()), e.getStatus());
                }
                autoSize(orderSheet, 6);
            }

            if (data.getWarehouseBreakdown() != null && !data.getWarehouseBreakdown().isEmpty()) {
                XSSFSheet whSheet = wb.createSheet("By Warehouse");
                XSSFRow hdr = whSheet.createRow(0);
                writeHeaders(hdr, whSheet, "Warehouse", "Orders", "Active", "Value (₹)");
                int r = 1;
                for (PurchaseReportResponse.WarehouseOrderEntry e : data.getWarehouseBreakdown()) {
                    XSSFRow cr = whSheet.createRow(r++);
                    writeCells(cr, e.getWarehouseName(), str(e.getOrderCount()), str(e.getActiveOrders()), currency(e.getTotalValue()));
                }
                autoSize(whSheet, 4);
            }

            autoSize(summary, 4);
            return toBytes(wb);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Purchase Excel", e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  HELPER METHODS
    // ═══════════════════════════════════════════════════════════

    private void writeTitleRow(XSSFSheet sheet, String title, String subtitle) {
        XSSFWorkbook wb = sheet.getWorkbook();
        XSSFRow titleRow = sheet.createRow(0);
        XSSFCell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(title);
        XSSFCellStyle titleStyle = wb.createCellStyle();
        XSSFFont titleFont = wb.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleFont.setColor(new XSSFColor(DARK_RGB, null));
        titleStyle.setFont(titleFont);
        titleCell.setCellStyle(titleStyle);

        XSSFRow subRow = sheet.createRow(1);
        XSSFCell subCell = subRow.createCell(0);
        subCell.setCellValue(subtitle + "  |  Generated: " + LocalDateTime.now().format(DT_FMT));
        XSSFCellStyle subStyle = wb.createCellStyle();
        XSSFFont subFont = wb.createFont();
        subFont.setFontHeightInPoints((short) 9);
        subFont.setColor(new XSSFColor(GRAY_RGB, null));
        subStyle.setFont(subFont);
        subCell.setCellStyle(subStyle);
    }

    private int writeStatCards(XSSFSheet sheet, int startRow, String[][] cards) {
        int row = startRow;
        XSSFWorkbook wb = sheet.getWorkbook();
        for (String[] card : cards) {
            XSSFRow r = sheet.createRow(row++);
            XSSFCell labelCell = r.createCell(0);
            labelCell.setCellValue(card[0]);
            XSSFCellStyle labelStyle = wb.createCellStyle();
            XSSFFont labelFont = wb.createFont();
            labelFont.setBold(true);
            labelFont.setFontHeightInPoints((short) 9);
            labelStyle.setFont(labelFont);
            labelCell.setCellStyle(labelStyle);

            XSSFCell valCell = r.createCell(1);
            valCell.setCellValue(card[1]);
            XSSFCellStyle valStyle = wb.createCellStyle();
            XSSFFont valFont = wb.createFont();
            valFont.setFontHeightInPoints((short) 11);
            valFont.setBold(true);
            valFont.setColor(new XSSFColor(BLUE_RGB, null));
            valStyle.setFont(valFont);
            valCell.setCellStyle(valStyle);
        }
        return row;
    }

    private void writeHeaders(XSSFRow row, XSSFSheet sheet, String... headers) {
        XSSFWorkbook wb = sheet.getWorkbook();
        XSSFCellStyle headerStyle = wb.createCellStyle();
        headerStyle.setFillForegroundColor(new XSSFColor(BLUE_RGB, null));
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        XSSFFont headerFont = wb.createFont();
        headerFont.setBold(true);
        headerFont.setColor(new XSSFColor(WHITE_RGB, null));
        headerFont.setFontHeightInPoints((short) 9);
        headerStyle.setFont(headerFont);

        for (int i = 0; i < headers.length; i++) {
            XSSFCell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void writeCells(XSSFRow row, String... values) {
        XSSFWorkbook wb = row.getSheet().getWorkbook();
        boolean alt = row.getRowNum() % 2 == 0;

        for (int i = 0; i < values.length; i++) {
            XSSFCell cell = row.createCell(i);
            cell.setCellValue(values[i] != null ? values[i] : "—");

            XSSFCellStyle style = wb.createCellStyle();
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            if (alt) {
                style.setFillForegroundColor(new XSSFColor(ALT_RGB, null));
                style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            }
            cell.setCellStyle(style);
        }
    }

    private void addTotalsRow(XSSFSheet sheet, int rowIdx, String... values) {
        XSSFRow row = sheet.createRow(rowIdx);
        XSSFWorkbook wb = sheet.getWorkbook();
        XSSFCellStyle totalsStyle = wb.createCellStyle();
        totalsStyle.setFillForegroundColor(new XSSFColor(LIGHT_RGB, null));
        totalsStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        totalsStyle.setBorderBottom(BorderStyle.THIN);
        totalsStyle.setBorderTop(BorderStyle.THIN);
        totalsStyle.setBorderLeft(BorderStyle.THIN);
        totalsStyle.setBorderRight(BorderStyle.THIN);
        XSSFFont boldFont = wb.createFont();
        boldFont.setBold(true);
        totalsStyle.setFont(boldFont);

        for (int i = 0; i < values.length; i++) {
            XSSFCell cell = row.createCell(i);
            cell.setCellValue(values[i] != null ? values[i] : "");
            cell.setCellStyle(totalsStyle);
        }
    }

    private void autoSize(XSSFSheet sheet, int cols) {
        for (int i = 0; i < cols; i++) {
            sheet.autoSizeColumn(i);
            int width = sheet.getColumnWidth(i);
            if (width < 3000) sheet.setColumnWidth(i, 3000);
            if (width > 12000) sheet.setColumnWidth(i, 12000);
        }
    }

    private byte[] toBytes(XSSFWorkbook wb) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        wb.write(out);
        return out.toByteArray();
    }

    // ─── Formatters ──────────────────────────────────────────

    private String str(long val) { return String.valueOf(val); }

    private String currency(BigDecimal val) {
        if (val == null) return "₹0";
        return "₹" + val.setScale(0, java.math.RoundingMode.HALF_UP).toString();
    }

    private String pct(Double val) {
        if (val == null) return "0%";
        return String.format("%.1f%%", val);
    }
}
