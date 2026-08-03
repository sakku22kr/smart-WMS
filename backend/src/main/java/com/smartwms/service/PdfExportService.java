package com.smartwms.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.*;
import com.smartwms.dto.response.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class PdfExportService {

    private static final Color PRIMARY      = new Color(59, 130, 246);
    private static final Color PRIMARY_DARK = new Color(37, 99, 235);
    private static final Color HEADER_BG   = new Color(241, 245, 249);
    private static final Color WHITE       = Color.WHITE;
    private static final Color TEXT_DARK   = new Color(30, 41, 59);
    private static final Color TEXT_MED    = new Color(71, 85, 105);
    private static final Color BORDER      = new Color(203, 213, 225);
    private static final Color TABLE_ALT   = new Color(248, 250, 252);
    private static final Color BLUE_50     = new Color(239, 246, 255);

    private static final Font TITLE_FONT   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, TEXT_DARK);
    private static final Font SUB_FONT     = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXT_MED);
    private static final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, PRIMARY_DARK);
    private static final Font TABLE_HEADER = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, WHITE);
    private static final Font TABLE_CELL   = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_DARK);
    private static final Font FOOTER_FONT  = FontFactory.getFont(FontFactory.HELVETICA, 7, TEXT_MED);
    private static final Font STAT_FONT    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, PRIMARY_DARK);
    private static final Font STAT_LABEL   = FontFactory.getFont(FontFactory.HELVETICA, 7, TEXT_MED);
    private static final Font FILTER_FONT  = FontFactory.getFont(FontFactory.HELVETICA, 8, PRIMARY_DARK);

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
    private static final DateTimeFormatter D_FMT  = DateTimeFormatter.ofPattern("dd MMM yyyy");

    // ═══════════════════════════════════════════════════════════
    //  EXPORT — 5 methods
    // ═══════════════════════════════════════════════════════════

    public byte[] exportInventoryReport(InventoryReportResponse data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 54);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Inventory Report", "Stock levels, movements, and alerts");
            addInventoryFilterInfo(doc, data.getFilters());
            addInventorySummary(doc, data);
            addCategoryTable(doc, data.getCategoryBreakdown());
            addWarehouseStockTable(doc, data.getWarehouseBreakdown());
            addTopProductsTable(doc, data.getTopProductsByValue());
            addReorderAlertsTable(doc, data.getReorderAlerts());
            doc.close();
        } catch (Exception e) {
            log.error("PDF generation failed", e);
        }
        return baos.toByteArray();
    }

    public byte[] exportProductReport(ProductReportResponse data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 54);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Product Report", "Catalog analytics and breakdowns");
            addProductFilterInfo(doc, data.getFilters());
            addProductSummary(doc, data);
            addProductCategoryTable(doc, data.getCategoryBreakdown());
            addProductSupplierTable(doc, data.getSupplierBreakdown());
            addProductListTable(doc, data.getProducts());
            doc.close();
        } catch (Exception e) {
            log.error("PDF generation failed", e);
        }
        return baos.toByteArray();
    }

    public byte[] exportWarehouseReport(WarehouseReportResponse data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 54);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Warehouse Report", "Capacity and utilization metrics");
            addWarehouseSummary(doc, data);
            addWarehouseDetailsTable(doc, data.getWarehouses());
            addWarehouseValueTable(doc, data.getValueBreakdown());
            addWarehousePOTable(doc, data.getOrdersPerWarehouse());
            doc.close();
        } catch (Exception e) {
            log.error("PDF generation failed", e);
        }
        return baos.toByteArray();
    }

    public byte[] exportSupplierReport(SupplierReportResponse data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 54);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Supplier Report", "Supplier performance and procurement analytics");
            addSupplierFilterInfo(doc, data.getFilters());
            addSupplierSummary(doc, data);
            addSupplierListTable(doc, data.getSuppliers());
            addSupplierValueTable(doc, data.getTopSuppliersByValue());
            addSupplierRegionTable(doc, data.getRegionBreakdown());
            doc.close();
        } catch (Exception e) {
            log.error("PDF generation failed", e);
        }
        return baos.toByteArray();
    }

    public byte[] exportPurchaseReport(PurchaseReportResponse data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 54, 54);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addHeader(doc, "Purchase Report", "Purchase orders and spending trends");
            addPurchaseFilterInfo(doc, data.getFilters());
            addPurchaseSummary(doc, data);
            addPurchaseStatusTable(doc, data.getStatusBreakdown());
            addPurchaseSupplierTable(doc, data.getTopSuppliers());
            addPurchaseOrderTable(doc, data.getOrders());
            addPurchaseWarehouseTable(doc, data.getWarehouseBreakdown());
            doc.close();
        } catch (Exception e) {
            log.error("PDF generation failed", e);
        }
        return baos.toByteArray();
    }

    // ═══════════════════════════════════════════════════════════
    //  HEADER / SECTION / TABLE BUILDERS
    // ═══════════════════════════════════════════════════════════

    private void addHeader(Document doc, String title, String subtitle) throws DocumentException {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        PdfPCell c = new PdfPCell(new Paragraph(title, TITLE_FONT));
        c.setBorder(PdfPCell.NO_BORDER); c.setPaddingBottom(4); t.addCell(c);
        c = new PdfPCell(new Paragraph(subtitle, SUB_FONT));
        c.setBorder(PdfPCell.NO_BORDER); c.setPaddingBottom(2); t.addCell(c);
        c = new PdfPCell(new Paragraph("Generated: " + LocalDateTime.now().format(DT_FMT), FOOTER_FONT));
        c.setBorder(PdfPCell.NO_BORDER); c.setPaddingBottom(8); t.addCell(c);
        c = new PdfPCell(); c.setBorder(PdfPCell.BOTTOM); c.setBorderColor(BORDER); c.setBorderWidth(1); c.setFixedHeight(1); c.setPaddingBottom(6); t.addCell(c);
        doc.add(t);
        doc.add(new Paragraph(" "));
    }

    private void addFilterBlock(Document doc, String text) {
        try {
            PdfPTable t = new PdfPTable(1);
            t.setWidthPercentage(100);
            PdfPCell c = new PdfPCell();
            c.setBorder(PdfPCell.BOX); c.setBorderColor(PRIMARY); c.setBorderWidth(0.5f);
            c.setBackgroundColor(BLUE_50); c.setPadding(8);
            c.addElement(new Paragraph("Active Filters: " + text, FILTER_FONT));
            t.addCell(c);
            doc.add(t); doc.add(new Paragraph(" "));
        } catch (Exception e) { log.warn("Filter block failed", e); }
    }

    private void addSection(Document doc, String title) throws DocumentException {
        Paragraph p = new Paragraph(title, SECTION_FONT);
        p.setSpacingBefore(10); p.setSpacingAfter(4); doc.add(p);
        PdfPTable line = new PdfPTable(1); line.setWidthPercentage(100);
        PdfPCell c = new PdfPCell(); c.setBorder(PdfPCell.BOTTOM); c.setBorderColor(PRIMARY); c.setBorderWidth(1); c.setFixedHeight(1); c.setPaddingBottom(6);
        line.addCell(c); doc.add(line);
    }

    private PdfPTable createTable(int cols, float[] widths) {
        PdfPTable t = new PdfPTable(cols);
        if (widths != null) t.setWidths(widths);
        t.setWidthPercentage(100); t.setSpacingBefore(4); t.setSpacingAfter(8);
        return t;
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String h : headers) {
            PdfPCell c = new PdfPCell(new Paragraph(h, TABLE_HEADER));
            c.setBackgroundColor(PRIMARY); c.setPadding(6);
            c.setBorder(PdfPCell.BOTTOM); c.setBorderWidth(0.5f); c.setBorderColor(PRIMARY_DARK);
            c.setHorizontalAlignment(PdfPCell.ALIGN_LEFT); table.addCell(c);
        }
    }

    private void addTableRow(PdfPTable table, String... vals) {
        int idx = table.size();
        for (String v : vals) {
            PdfPCell c = new PdfPCell(new Paragraph(v != null ? v : "—", TABLE_CELL));
            c.setPadding(5); c.setBorder(PdfPCell.BOTTOM); c.setBorderWidth(0.3f); c.setBorderColor(BORDER);
            c.setBackgroundColor(idx % 2 == 0 ? TABLE_ALT : WHITE); table.addCell(c);
        }
    }

    private void addTableToDoc(Document doc, PdfPTable table) throws DocumentException {
        doc.add(table); doc.add(new Paragraph(" "));
    }

    private PdfPTable createStatTable() {
        PdfPTable t = new PdfPTable(4); t.setWidthPercentage(100);
        return t;
    }

    private void addStatCell(PdfPTable table, String value, String label) {
        PdfPCell c = new PdfPCell();
        c.setBorder(PdfPCell.BOX); c.setBorderColor(BORDER); c.setBorderWidth(0.5f);
        c.setPadding(8); c.setBackgroundColor(HEADER_BG);
        Paragraph vp = new Paragraph(value, STAT_FONT); vp.setSpacingAfter(1); c.addElement(vp);
        c.addElement(new Paragraph(label, STAT_LABEL)); table.addCell(c);
    }

    private void addEmptyPara(Document doc) throws DocumentException { doc.add(new Paragraph(" ")); }

    // ═══════════════════════════════════════════════════════════
    //  INVENTORY
    // ═══════════════════════════════════════════════════════════

    private void addInventoryFilterInfo(Document doc, InventoryReportResponse.FilterInfo f) {
        if (f == null) return;
        StringBuilder sb = new StringBuilder();
        if (f.getWarehouseName() != null) sb.append("Warehouse: ").append(f.getWarehouseName()).append(" | ");
        if (f.getDateFrom() != null) sb.append("From: ").append(f.getDateFrom().format(DT_FMT)).append(" | ");
        if (f.getDateTo() != null) sb.append("To: ").append(f.getDateTo().format(DT_FMT)).append(" | ");
        if (sb.length() > 0) addFilterBlock(doc, sb.toString().replaceAll("\\s*\\|\\s*$", ""));
    }

    private void addInventorySummary(Document doc, InventoryReportResponse data) throws DocumentException {
        PdfPTable s = createStatTable();
        addStatCell(s, str(data.getTotalProducts()), "Total Products");
        addStatCell(s, str(data.getTotalStockQuantity()), "Total Stock");
        addStatCell(s, currency(data.getTotalInventoryValue()), "Inventory Value");
        addStatCell(s, currency(data.getAverageSellingPrice()), "Avg Price");
        doc.add(s); addEmptyPara(doc);
        PdfPTable s2 = createStatTable();
        addStatCell(s2, str(data.getLowStockCount()), "Low Stock");
        addStatCell(s2, str(data.getOutOfStockCount()), "Out of Stock");
        addStatCell(s2, str(data.getActiveProducts()), "Active");
        addStatCell(s2, str(data.getInactiveProducts()), "Inactive");
        doc.add(s2); addEmptyPara(doc);
    }

    private void addCategoryTable(Document doc, List<InventoryReportResponse.CategoryStockEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Category Breakdown");
        PdfPTable t = createTable(4, new float[]{3f, 1.5f, 1.5f, 2f});
        addTableHeader(t, "Category", "Products", "Stock", "Value (₹)");
        for (InventoryReportResponse.CategoryStockEntry e : list) addTableRow(t, e.getCategoryName(), str(e.getProductCount()), str(e.getTotalStock()), currency(e.getTotalValue()));
        addTableToDoc(doc, t);
    }

    private void addWarehouseStockTable(Document doc, List<InventoryReportResponse.WarehouseStockEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Warehouse Breakdown");
        PdfPTable t = createTable(4, new float[]{3f, 1.5f, 1.5f, 2f});
        addTableHeader(t, "Warehouse", "Products", "Stock", "Utilization");
        for (InventoryReportResponse.WarehouseStockEntry e : list) addTableRow(t, e.getWarehouseName(), str(e.getProductCount()), str(e.getTotalStock()), pct(e.getCapacityUtilization()));
        addTableToDoc(doc, t);
    }

    private void addTopProductsTable(Document doc, List<InventoryReportResponse.ProductStockEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Top Products by Value");
        PdfPTable t = createTable(5, new float[]{3f, 2f, 1.5f, 1.5f, 2f});
        addTableHeader(t, "Product", "SKU", "Stock", "Price (₹)", "Value (₹)");
        for (InventoryReportResponse.ProductStockEntry e : list) addTableRow(t, e.getName(), e.getSku(), str(e.getCurrentStock()), currency(e.getSellingPrice()), currency(e.getStockValue()));
        addTableToDoc(doc, t);
    }

    private void addReorderAlertsTable(Document doc, List<InventoryReportResponse.ProductStockEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Reorder Alerts");
        PdfPTable t = createTable(4, new float[]{3f, 2f, 1.5f, 1.5f});
        addTableHeader(t, "Product", "SKU", "Stock", "Reorder Level");
        for (InventoryReportResponse.ProductStockEntry e : list) addTableRow(t, e.getName(), e.getSku(), str(e.getCurrentStock()), str(e.getReorderLevel()));
        addTableToDoc(doc, t);
    }

    // ═══════════════════════════════════════════════════════════
    //  PRODUCT
    // ═══════════════════════════════════════════════════════════

    private void addProductFilterInfo(Document doc, ProductReportResponse.FilterInfo f) {
        if (f == null) return;
        StringBuilder sb = new StringBuilder();
        if (f.getSearch() != null && !f.getSearch().isEmpty()) sb.append("Search: \"").append(f.getSearch()).append("\" | ");
        if (f.getCategoryName() != null) sb.append("Category: ").append(f.getCategoryName()).append(" | ");
        if (f.getSupplierName() != null) sb.append("Supplier: ").append(f.getSupplierName()).append(" | ");
        if (f.getStatus() != null) sb.append("Status: ").append(f.getStatus()).append(" | ");
        if (f.getWarehouseName() != null) sb.append("Warehouse: ").append(f.getWarehouseName()).append(" | ");
        if (sb.length() > 0) addFilterBlock(doc, sb.toString().replaceAll("\\s*\\|\\s*$", ""));
    }

    private void addProductSummary(Document doc, ProductReportResponse data) throws DocumentException {
        ProductReportResponse.ProductStatistics s = data.getStatistics();
        if (s == null) return;
        PdfPTable st = createStatTable();
        addStatCell(st, str(s.getTotalProducts()), "Total Products");
        addStatCell(st, str(s.getTotalStockQuantity()), "Total Stock");
        addStatCell(st, currency(s.getTotalStockValue()), "Stock Value");
        addStatCell(st, currency(s.getAveragePrice()), "Avg Price");
        doc.add(st); addEmptyPara(doc);
        PdfPTable st2 = createStatTable();
        addStatCell(st2, str(s.getLowStockCount()), "Low Stock");
        addStatCell(st2, str(s.getOutOfStockCount()), "Out of Stock");
        addStatCell(st2, str(s.getCategoryCount()), "Categories");
        addStatCell(st2, str(s.getSupplierCount()), "Suppliers");
        doc.add(st2); addEmptyPara(doc);
    }

    private void addProductCategoryTable(Document doc, List<ProductReportResponse.CategoryProductEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Category Breakdown");
        PdfPTable t = createTable(4, new float[]{3f, 1.5f, 1.5f, 2f});
        addTableHeader(t, "Category", "Products", "Stock", "Value (₹)");
        for (ProductReportResponse.CategoryProductEntry e : list) addTableRow(t, e.getCategoryName(), str(e.getProductCount()), str(e.getTotalStock()), currency(e.getTotalValue()));
        addTableToDoc(doc, t);
    }

    private void addProductSupplierTable(Document doc, List<ProductReportResponse.SupplierProductEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Supplier Breakdown");
        PdfPTable t = createTable(4, new float[]{3f, 1.5f, 1.5f, 2f});
        addTableHeader(t, "Supplier", "Products", "Stock", "Value (₹)");
        for (ProductReportResponse.SupplierProductEntry e : list) addTableRow(t, e.getSupplierName(), str(e.getProductCount()), str(e.getTotalStock()), currency(e.getTotalValue()));
        addTableToDoc(doc, t);
    }

    private void addProductListTable(Document doc, ProductReportResponse.ProductList list) throws DocumentException {
        if (list == null || list.getItems() == null || list.getItems().isEmpty()) return;
        addSection(doc, "Product List");
        PdfPTable t = createTable(6, new float[]{2.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f});
        addTableHeader(t, "Name", "SKU", "Category", "Stock", "Price (₹)", "Status");
        for (ProductReportResponse.ProductEntry e : list.getItems()) addTableRow(t, e.getName(), e.getSku(), e.getCategoryName(), str(e.getCurrentStock()), currency(e.getSellingPrice()), e.getStatus());
        addTableToDoc(doc, t);
    }

    // ═══════════════════════════════════════════════════════════
    //  WAREHOUSE
    // ═══════════════════════════════════════════════════════════

    private void addWarehouseSummary(Document doc, WarehouseReportResponse data) throws DocumentException {
        WarehouseReportResponse.WarehouseStatistics s = data.getStatistics();
        if (s == null) return;
        PdfPTable st = createStatTable();
        addStatCell(st, str(s.getTotalWarehouses()), "Total Warehouses");
        addStatCell(st, str(s.getActiveWarehouses()), "Active");
        addStatCell(st, pct(s.getUtilizationPercentage()), "Utilization");
        addStatCell(st, currency(s.getTotalInventoryValue()), "Inventory Value");
        doc.add(st); addEmptyPara(doc);
        PdfPTable st2 = createStatTable();
        addStatCell(st2, str(s.getTotalProducts()), "Total Products");
        addStatCell(st2, str(s.getTotalStockQuantity()), "Total Stock");
        addStatCell(st2, str(s.getNearCapacityCount()), "Near Capacity");
        addStatCell(st2, str(s.getFullCapacityCount()), "Full Capacity");
        doc.add(st2); addEmptyPara(doc);
    }

    private void addWarehouseDetailsTable(Document doc, List<WarehouseReportResponse.WarehouseEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Warehouse Details");
        PdfPTable t = createTable(7, new float[]{2.5f, 1f, 1.5f, 1.5f, 1.5f, 1.5f, 1.2f});
        addTableHeader(t, "Warehouse", "Code", "Products", "Stock", "Value (₹)", "Utilization", "Status");
        for (WarehouseReportResponse.WarehouseEntry e : list) addTableRow(t, e.getName(), e.getCode(), str(e.getProductCount()), str(e.getTotalStock()), currency(e.getInventoryValue()), pct(e.getUtilizationPercent()), e.getStatus());
        addTableToDoc(doc, t);
    }

    private void addWarehouseValueTable(Document doc, List<WarehouseReportResponse.WarehouseValueEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Inventory Value by Warehouse");
        PdfPTable t = createTable(5, new float[]{2.5f, 1.5f, 1.5f, 2f, 2f});
        addTableHeader(t, "Warehouse", "Products", "Stock", "Inventory Value (₹)", "Purchase Value (₹)");
        for (WarehouseReportResponse.WarehouseValueEntry e : list) addTableRow(t, e.getName(), str(e.getProductCount()), str(e.getTotalStock()), currency(e.getInventoryValue()), currency(e.getPurchaseValue()));
        addTableToDoc(doc, t);
    }

    private void addWarehousePOTable(Document doc, List<WarehouseReportResponse.WarehousePOCount> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Purchase Orders by Warehouse");
        PdfPTable t = createTable(4, new float[]{3f, 1.5f, 1.5f, 2f});
        addTableHeader(t, "Warehouse", "Orders", "Active", "Value (₹)");
        for (WarehouseReportResponse.WarehousePOCount e : list) addTableRow(t, e.getWarehouseName(), str(e.getOrderCount()), str(e.getActiveOrders()), currency(e.getTotalValue()));
        addTableToDoc(doc, t);
    }

    // ═══════════════════════════════════════════════════════════
    //  SUPPLIER
    // ═══════════════════════════════════════════════════════════

    private void addSupplierFilterInfo(Document doc, SupplierReportResponse.FilterInfo f) {
        if (f == null) return;
        StringBuilder sb = new StringBuilder();
        if (f.getSearch() != null && !f.getSearch().isEmpty()) sb.append("Search: \"").append(f.getSearch()).append("\" | ");
        if (f.getStatus() != null) sb.append("Status: ").append(f.getStatus()).append(" | ");
        if (f.getRegion() != null) sb.append("Region: ").append(f.getRegion()).append(" | ");
        if (sb.length() > 0) addFilterBlock(doc, sb.toString().replaceAll("\\s*\\|\\s*$", ""));
    }

    private void addSupplierSummary(Document doc, SupplierReportResponse data) throws DocumentException {
        SupplierReportResponse.SupplierStatistics s = data.getStatistics();
        if (s == null) return;
        PdfPTable st = createStatTable();
        addStatCell(st, str(s.getTotalSuppliers()), "Total Suppliers");
        addStatCell(st, str(s.getActiveSuppliers()), "Active");
        addStatCell(st, s.getAverageRating() != null ? String.format("%.1f", s.getAverageRating()) : "—", "Avg Rating");
        addStatCell(st, currency(s.getTotalProcurementValue()), "Total Spend");
        doc.add(st); addEmptyPara(doc);
    }

    private void addSupplierListTable(Document doc, SupplierReportResponse.SupplierList list) throws DocumentException {
        if (list == null || list.getItems() == null || list.getItems().isEmpty()) return;
        addSection(doc, "Supplier List");
        PdfPTable t = createTable(6, new float[]{2.5f, 1.5f, 2f, 1.5f, 1.5f, 1.2f});
        addTableHeader(t, "Supplier", "Code", "Contact", "Products", "Orders", "Rating");
        for (SupplierReportResponse.SupplierEntry e : list.getItems()) addTableRow(t, e.getName(), e.getCode(), e.getContactPerson(), str(e.getProductCount()), str(e.getOrderCount()), e.getRating() != null ? String.format("%.1f", e.getRating()) : "—");
        addTableToDoc(doc, t);
    }

    private void addSupplierValueTable(Document doc, List<SupplierReportResponse.SupplierValueEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Top Suppliers by Order Value");
        PdfPTable t = createTable(5, new float[]{2.5f, 2f, 1.5f, 1.5f, 2f});
        addTableHeader(t, "Supplier", "Company", "Orders", "Rating", "Total Value (₹)");
        for (SupplierReportResponse.SupplierValueEntry e : list) addTableRow(t, e.getName(), e.getCompanyName(), str(e.getOrderCount()), e.getRating() != null ? String.format("%.1f", e.getRating()) : "—", currency(e.getTotalOrderValue()));
        addTableToDoc(doc, t);
    }

    private void addSupplierRegionTable(Document doc, List<SupplierReportResponse.RegionCount> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Region Breakdown");
        PdfPTable t = createTable(3, new float[]{3f, 2f, 3f});
        addTableHeader(t, "Region", "Count", "Total Value (₹)");
        for (SupplierReportResponse.RegionCount e : list) addTableRow(t, e.getRegion(), str(e.getCount()), currency(e.getTotalValue()));
        addTableToDoc(doc, t);
    }

    // ═══════════════════════════════════════════════════════════
    //  PURCHASE
    // ═══════════════════════════════════════════════════════════

    private void addPurchaseFilterInfo(Document doc, PurchaseReportResponse.FilterInfo f) {
        if (f == null) return;
        StringBuilder sb = new StringBuilder();
        if (f.getSearch() != null && !f.getSearch().isEmpty()) sb.append("Search: \"").append(f.getSearch()).append("\" | ");
        if (f.getSupplierName() != null) sb.append("Supplier: ").append(f.getSupplierName()).append(" | ");
        if (f.getWarehouseName() != null) sb.append("Warehouse: ").append(f.getWarehouseName()).append(" | ");
        if (f.getStatus() != null) sb.append("Status: ").append(f.getStatus()).append(" | ");
        if (f.getDateFrom() != null) sb.append("From: ").append(f.getDateFrom().format(D_FMT)).append(" | ");
        if (f.getDateTo() != null) sb.append("To: ").append(f.getDateTo().format(D_FMT)).append(" | ");
        if (sb.length() > 0) addFilterBlock(doc, sb.toString().replaceAll("\\s*\\|\\s*$", ""));
    }

    private void addPurchaseSummary(Document doc, PurchaseReportResponse data) throws DocumentException {
        PurchaseReportResponse.PurchaseStatistics s = data.getStatistics();
        long totalOrders = s != null ? s.getTotalOrders() : data.getTotalOrders();
        BigDecimal totalValue = s != null ? s.getTotalValue() : data.getTotalValue();
        long activeCount = s != null ? s.getActiveCount() : data.getActiveCount();
        long completedCount = s != null ? s.getCompletedCount() : data.getCompletedCount();
        PdfPTable st = createStatTable();
        addStatCell(st, str(totalOrders), "Total Orders");
        addStatCell(st, currency(totalValue), "Total Value");
        addStatCell(st, str(activeCount), "Active");
        addStatCell(st, str(completedCount), "Completed");
        doc.add(st); addEmptyPara(doc);
    }

    private void addPurchaseStatusTable(Document doc, List<PurchaseReportResponse.StatusValueEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Status Breakdown");
        PdfPTable t = createTable(3, new float[]{3f, 2f, 3f});
        addTableHeader(t, "Status", "Count", "Value (₹)");
        for (PurchaseReportResponse.StatusValueEntry e : list) addTableRow(t, e.getStatus(), str(e.getCount()), currency(e.getTotalValue()));
        addTableToDoc(doc, t);
    }

    private void addPurchaseSupplierTable(Document doc, List<PurchaseReportResponse.SupplierOrderEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Top Suppliers by Spend");
        PdfPTable t = createTable(4, new float[]{3f, 1.5f, 1.5f, 2.5f});
        addTableHeader(t, "Supplier", "Orders", "Completed", "Total Value (₹)");
        for (PurchaseReportResponse.SupplierOrderEntry e : list) addTableRow(t, e.getSupplierName(), str(e.getOrderCount()), str(e.getCompletedCount()), currency(e.getTotalValue()));
        addTableToDoc(doc, t);
    }

    private void addPurchaseOrderTable(Document doc, PurchaseReportResponse.OrderList list) throws DocumentException {
        if (list == null || list.getItems() == null || list.getItems().isEmpty()) return;
        addSection(doc, "Order List");
        PdfPTable t = createTable(6, new float[]{2f, 2f, 2f, 1.5f, 1.5f, 1.5f});
        addTableHeader(t, "Order #", "Supplier", "Warehouse", "Date", "Amount (₹)", "Status");
        for (PurchaseReportResponse.OrderSummaryEntry e : list.getItems()) addTableRow(t, e.getOrderNumber(), e.getSupplierName(), e.getWarehouseName() != null ? e.getWarehouseName() : "—", e.getOrderDate() != null ? e.getOrderDate().toString() : "—", currency(e.getTotalAmount()), e.getStatus());
        addTableToDoc(doc, t);
    }

    private void addPurchaseWarehouseTable(Document doc, List<PurchaseReportResponse.WarehouseOrderEntry> list) throws DocumentException {
        if (list == null || list.isEmpty()) return;
        addSection(doc, "Orders by Warehouse");
        PdfPTable t = createTable(4, new float[]{3f, 1.5f, 1.5f, 2.5f});
        addTableHeader(t, "Warehouse", "Orders", "Active", "Value (₹)");
        for (PurchaseReportResponse.WarehouseOrderEntry e : list) addTableRow(t, e.getWarehouseName(), str(e.getOrderCount()), str(e.getActiveOrders()), currency(e.getTotalValue()));
        addTableToDoc(doc, t);
    }

    // ─── Formatters ──────────────────────────────────────────
    private String str(long v) { return String.valueOf(v); }
    private String currency(BigDecimal v) { return v == null ? "₹0" : "₹" + v.setScale(0, java.math.RoundingMode.HALF_UP); }
    private String pct(Double v) { return v == null ? "0%" : String.format("%.1f%%", v); }
}
