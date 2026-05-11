import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ALIGN_CENTER: Partial<ExcelJS.Alignment> = {
  vertical: "middle",
  horizontal: "center",
};
const ALIGN_VERTICAL: Partial<ExcelJS.Alignment> = {
  vertical: "middle",
  horizontal: "center",
  textRotation: 90,
};

interface DayData {
  targetDate: string;
  dayProduction: any[];
  weekProduction: any[];
  monthProduction: any[];
  dayRejects: any[];
  weekRejects: any[];
}

export const generateProductionReport = async (
  products: any[],
  measures: any[],
  dataByDay: DayData[],
) => {
  const workbook = new ExcelJS.Workbook();

  for (const day of dataByDay) {
    const { targetDate, dayProduction, weekProduction, monthProduction } = day;
    const exactTargetDate = targetDate.split("T")[0];
    const strictDayProduction = dayProduction.filter((dp) => {
      const recordDate = dp.date || dp.createdAt;
      if (!recordDate) return false;
      return recordDate.split("T")[0] === exactTargetDate;
    });

    const worksheet = workbook.addWorksheet(exactTargetDate);

    // --- CONFIGURACIÓN DE COLUMNAS ---
    const colTotal = 3 + measures.length;
    const colTipo = colTotal + 1;
    const colAcumSem = colTotal + 2;
    const colAcumMes = colTotal + 3;

    worksheet.getColumn(1).width = 8;
    worksheet.getColumn(2).width = 40;
    measures.forEach((_, i) => (worksheet.getColumn(3 + i).width = 11));
    [colTotal, colTipo, colAcumSem, colAcumMes].forEach(
      (c) => (worksheet.getColumn(c).width = 14),
    );

    // --- CONFIGURACIÓN DE FECHAS ---
    const dateObj = new Date(targetDate + "T00:00:00");
    const fechaCompleta = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const nombreDia = diasSemana[dateObj.getDay()];

    const current = new Date(dateObj);
    const diff =
      current.getDate() - current.getDay() + (current.getDay() === 0 ? -6 : 1);
    const monday = new Date(new Date(current).setDate(diff));
    const sunday = new Date(new Date(monday).setDate(monday.getDate() + 6));
    const rangoSemana = `${monday.getDate()}/${monday.getMonth() + 1}/${monday.getFullYear()} al ${sunday.getDate()}/${sunday.getMonth() + 1}/${sunday.getFullYear()}`;

    const boldFont = { name: "Arial", size: 10, bold: true };
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    const centerAlignment: Partial<ExcelJS.Alignment> = {
      vertical: "middle",
      horizontal: "center",
    };
    const yellowFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFF00" },
    };
    const greenFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9EAD3" },
    };

    worksheet.mergeCells("A1:D1");
    worksheet.getCell("A1").value = "INDUSTRIAL PARAÍSO C.A.";
    worksheet.getCell("A1").font = { ...boldFont, size: 14 };

    worksheet.mergeCells("A2:D2");
    worksheet.getCell("A2").value = "HOJA DE CIERRE - PRODUCCIÓN DIARIA";
    worksheet.getCell("A2").font = boldFont;

    worksheet.getCell("E1").value = "Fecha Producción:";
    worksheet.getCell("G1").value = fechaCompleta;
    worksheet.getCell("G1").font = boldFont;
    worksheet.getCell("I1").value = nombreDia;

    worksheet.getCell("E2").value = "Semana del:";
    worksheet.mergeCells("G2:H2");
    worksheet.getCell("G2").value = rangoSemana;
    worksheet.getCell("G2").font = boldFont;

    // --- TABLA PRINCIPAL ---
    worksheet.mergeCells(5, 1, 5, colAcumMes);
    const hCell = worksheet.getCell(5, 1);
    hCell.value = "H O R A R I O   N O R M A L";
    hCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };
    hCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    hCell.alignment = ALIGN_CENTER;

    const headRow = worksheet.getRow(6);
    headRow.getCell(2).value = "PRODUCTO";
    measures.forEach((m, i) => (headRow.getCell(3 + i).value = m.name));
    headRow.getCell(colTotal).value = "Total";
    headRow.getCell(colTipo).value = "Tipo (%)";
    headRow.getCell(colAcumSem).value = "Acum. Sem";
    headRow.getCell(colAcumMes).value = "Acum. Mes";
    headRow.eachCell((c) => {
      c.font = boldFont;
      c.alignment = ALIGN_CENTER;
      c.border = borderStyle;
    });

    let currentRow = 7;
    const categorias = ["Lujo", "Semi-Lujo", "Normal"];
    const totalGeneralDia = strictDayProduction.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );
    const granTotalDia = strictDayProduction.reduce(
      (a, b) => a + b.quantity,
      0,
    );
    const granTotalMedidas = new Array(measures.length).fill(0);
    const subTotalesCat: Record<string, number> = {};

    categorias.forEach((cat) => {
      const productsInCat = products.filter((p) => p.category === cat);
      if (productsInCat.length === 0) return;

      const startRow = currentRow;
      const subtotalesMedida = new Array(measures.length).fill(0);
      let totalCatDia = 0;

      productsInCat.forEach((prod) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(2).value = prod.name;
        row.getCell(2).border = borderStyle;

        let sumaProductoDia = 0;
        measures.forEach((m, mIdx) => {
          const qty = strictDayProduction
            .filter(
              (dp) =>
                dp.productID === prod.productID && dp.measureID === m.measureID,
            )
            .reduce((acc, curr) => acc + curr.quantity, 0);

          const cell = row.getCell(3 + mIdx);
          cell.value = qty > 0 ? qty : "";
          cell.fill = greenFill;
          cell.border = borderStyle;
          cell.alignment = centerAlignment;

          sumaProductoDia += qty;
          subtotalesMedida[mIdx] += qty;
          granTotalMedidas[mIdx] += qty;
        });

        row.getCell(colTotal).value =
          sumaProductoDia > 0 ? sumaProductoDia : "";
        row.getCell(colTotal).border = borderStyle;
        row.getCell(colTotal).alignment = centerAlignment;

        totalCatDia += sumaProductoDia;

        if (totalGeneralDia > 0 && sumaProductoDia > 0) {
          const pCell = row.getCell(colTipo);
          pCell.value = sumaProductoDia / totalGeneralDia;
          pCell.numFmt = "0.00%";
        } else {
          row.getCell(colTipo).value = "";
        }
        row.getCell(colTipo).border = borderStyle;

        const sem = weekProduction
          .filter((wp) => wp.productID === prod.productID)
          .reduce((acc, curr) => acc + curr.quantity, 0);

        row.getCell(colAcumSem).value = sem > 0 ? sem : "";
        row.getCell(colAcumSem).border = borderStyle;
        row.getCell(colAcumSem).alignment = centerAlignment;

        row.getCell(colAcumMes).border = borderStyle;
        currentRow++;
      });

      const subRow = worksheet.getRow(currentRow);
      subRow.height = 25;
      subRow.getCell(2).value = `Sub-Total ${cat}`;

      measures.forEach((m, mIdx) => {
        const sumaMedidaCat = subtotalesMedida[mIdx];
        const cell = subRow.getCell(3 + mIdx);
        cell.value = sumaMedidaCat > 0 ? sumaMedidaCat : "";
      });

      subRow.getCell(colTotal).value = totalCatDia;

      subTotalesCat[cat] = totalCatDia;

      if (totalGeneralDia > 0 && totalCatDia > 0) {
        const pSubCell = subRow.getCell(colTipo);
        pSubCell.value = totalCatDia / totalGeneralDia;
        pSubCell.numFmt = "0.00%";
      }

      for (let i = 2; i <= colAcumMes; i++) {
        const cell = subRow.getCell(i);
        cell.fill = yellowFill;
        cell.border = borderStyle;
        cell.font = boldFont;
        cell.alignment = centerAlignment;
      }

      worksheet.mergeCells(startRow, 1, currentRow, 1);
      const catCell = worksheet.getCell(startRow, 1);
      catCell.value = cat;
      catCell.alignment = {
        vertical: "middle",
        horizontal: "center",
        textRotation: 90,
      };
      catCell.font = boldFont;
      catCell.border = borderStyle;

      currentRow += 2;
    });

    const buildSummary = (start: number) => {
      const labels = ["Totales por medidas", "% de Medidas", "Base 1.40"];
      labels.forEach((label, idx) => {
        const row = worksheet.getRow(start + idx);
        worksheet.mergeCells(row.number, 1, row.number, 2);
        row.getCell(1).value = label;
        measures.forEach((_, i) => {
          if (idx === 0) row.getCell(3 + i).value = granTotalMedidas[i] || "";
          if (idx === 1) {
            row.getCell(3 + i).value =
              granTotalDia > 0 ? granTotalMedidas[i] / granTotalDia : 0;
            row.getCell(3 + i).numFmt = "0.00";
          }
          if (idx === 2) {
            const baseVal =
              (granTotalMedidas[i] * (parseFloat(measures[i].name) || 1)) / 1.4;
            row.getCell(3 + i).value = Math.round(baseVal) || "";
          }
        });
        row.eachCell((c) => {
          c.font = boldFont;
          c.border = borderStyle;
          c.alignment = ALIGN_CENTER;
        });
      });
      return start + 4;
    };

    currentRow = buildSummary(currentRow);

    const buildControl = (start: number, isBase140: boolean) => {
      worksheet.mergeCells(start, 1, start, colAcumMes);
      worksheet.getCell(start, 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F81BD" },
      };

      const labels = ["Horario Normal", "Sub-Total", "TOTAL"];
      labels.forEach((label, idx) => {
        const row = worksheet.getRow(start + 1 + idx);
        worksheet.mergeCells(row.number, 1, row.number, 2);
        row.getCell(1).value = label;
        if (label === "Horario Normal" || label === "TOTAL") {
          measures.forEach((_, i) => {
            row.getCell(3 + i).value = isBase140
              ? Math.round(
                  (granTotalMedidas[i] * parseFloat(measures[i].name)) / 1.4,
                )
              : granTotalMedidas[i];
          });
        }
        row.eachCell((c) => {
          c.font = boldFont;
          c.border = borderStyle;
          c.alignment = ALIGN_CENTER;
        });
      });
      return start + 6;
    };

    currentRow = buildControl(currentRow, false);
    currentRow = buildControl(currentRow, true);

    worksheet.mergeCells(currentRow, 1, currentRow, 10);
    const resCell = worksheet.getCell(currentRow, 1);
    resCell.value = "Colchones de Resortes";

    resCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };

    resCell.font = {
      name: "Arial",
      size: 11,
      color: { argb: "00000000" },
      bold: true,
    };

    resCell.alignment = ALIGN_CENTER;
    resCell.border = borderStyle;

    currentRow++;

    categorias.forEach((cat) => {
      const row = worksheet.getRow(currentRow);

      worksheet.mergeCells(currentRow, 1, currentRow, 2);
      row.getCell(1).value = subTotalesCat[cat] || 0;
      worksheet.mergeCells(currentRow, 3, currentRow, 4);
      row.getCell(3).value = cat;
      worksheet.mergeCells(currentRow, 5, currentRow, 6);
      const porcCell = row.getCell(5);
      const totalCategoria = Number(subTotalesCat[cat] || 0);

      porcCell.value = granTotalDia > 0 ? totalCategoria / granTotalDia : 0;
      porcCell.numFmt = "0.00%";

      for (let c = 1; c <= 6; c++) {
        const cell = row.getCell(c);
        cell.border = borderStyle;
        cell.alignment = ALIGN_CENTER;

        cell.font = {
          name: "Arial",
          size: 10,
          color: { argb: "00000000" },
          bold: c === 3 || c === 5,
        };
      }

      currentRow++;
    });

    currentRow += 2;
    const finalStartRow = currentRow;

    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    const obsHeader = worksheet.getCell(currentRow, 1);
    obsHeader.value = "OBSERVACIONES";
    obsHeader.font = { name: "Arial", size: 10, bold: true };
    obsHeader.border = borderStyle;

    obsHeader.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.mergeCells(currentRow, 3, currentRow + 3, 7);
    const obsArea = worksheet.getCell(currentRow, 3);
    obsArea.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEBF1DE" },
    };
    obsArea.border = borderStyle;

    currentRow++;
    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    const dateCell = worksheet.getCell(currentRow, 1);
    const d = new Date(targetDate + "T00:00:00");
    dateCell.value = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    dateCell.font = { name: "Arial", size: 12, bold: true };
    dateCell.alignment = ALIGN_CENTER;
    dateCell.border = borderStyle;

    currentRow++;
    worksheet.mergeCells(currentRow, 1, currentRow + 1, 2);
    const dayNameCell = worksheet.getCell(currentRow, 1);
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    dayNameCell.value = dias[d.getDay()];
    dayNameCell.font = { name: "Arial", size: 11, bold: true };
    dayNameCell.alignment = ALIGN_CENTER;
    dayNameCell.border = borderStyle;

    const colRechazo = 8;
    const totalDayRejects =
      day.dayRejects?.reduce((a: number, b: any) => a + b.quantity, 0) || 0;
    const totalWeekRejects =
      day.weekRejects?.reduce((a: number, b: any) => a + b.quantity, 0) || 0;

    const rechazoHeader = [
      ["Productos Rechazados", "Día", "Acum"],
      [
        "Produccion Real",
        granTotalDia,
        weekProduction.reduce((a, b) => a + b.quantity, 0),
      ],
      ["Rechazados", totalDayRejects, totalWeekRejects],
      [
        "Produccion Bruta",
        granTotalDia + totalDayRejects,
        weekProduction.reduce((a, b) => a + b.quantity, 0) + totalWeekRejects,
      ],
    ];

    worksheet.getColumn(colRechazo).width = 28;
    worksheet.getColumn(colRechazo + 1).width = 14;
    worksheet.getColumn(colRechazo + 2).width = 14;

    let rRow = finalStartRow;
    rechazoHeader.forEach((rowValues, idx) => {
      const row = worksheet.getRow(rRow);
      row.getCell(colRechazo).value = rowValues[0];
      row.getCell(colRechazo + 1).value = rowValues[1];
      row.getCell(colRechazo + 2).value = rowValues[2];

      [0, 1, 2].forEach((i) => {
        const cell = row.getCell(colRechazo + i);
        cell.border = borderStyle;
        cell.alignment = ALIGN_CENTER;
        cell.font = {
          name: "Arial",
          size: 10,
          bold: idx === 0 || idx === 3 || i === 0,
        };
      });
      rRow++;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Reporte_Produccion.xlsx");
};
