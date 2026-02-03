import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak } from 'docx';
import { saveAs } from 'file-saver';

export const generatePDF = async (data, title = "Research Document") => {
  try {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.text(title, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);

    let yPosition = 35;

    // Add hypothesis section
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Phase 1: Hypotheses", 20, yPosition);
    yPosition += 10;

    if (data.hypotheses && data.hypotheses !== 'Section pending...') {
      const hypothesesLines = doc.splitTextToSize(data.hypotheses, 170);
      doc.setFontSize(11);
      hypothesesLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 6;
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }
    yPosition += 10;

    // Add experimental design section
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Phase 2: Experimental Design", 20, yPosition);
    yPosition += 10;

    if (data.experimentalDesign && data.experimentalDesign !== 'Section pending...') {
      const designLines = doc.splitTextToSize(data.experimentalDesign, 170);
      doc.setFontSize(11);
      designLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 6;
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }
    yPosition += 10;

    // Add grant proposal section
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Phase 3: Grant Proposal", 20, yPosition);
    yPosition += 10;

    if (data.grantProposal && data.grantProposal !== 'Section pending...') {
      const proposalLines = doc.splitTextToSize(data.grantProposal, 170);
      doc.setFontSize(11);
      proposalLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 6;
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};

export const generateDocx = async (data, title = "Research Document") => {
  try {
    const paragraphs = [];

    // Add title
    paragraphs.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Add hypothesis section
    paragraphs.push(
      new Paragraph({
        text: "Phase 1: Hypotheses",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200, before: 200 }
      })
    );

    if (data.hypotheses && data.hypotheses !== 'Section pending...') {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.hypotheses,
              size: 24
            })
          ],
          spacing: { after: 200 }
        })
      );
    }

    // Add experimental design section
    paragraphs.push(
      new Paragraph({
        text: "Phase 2: Experimental Design",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200, before: 200 }
      })
    );

    if (data.experimentalDesign && data.experimentalDesign !== 'Section pending...') {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.experimentalDesign,
              size: 24
            })
          ],
          spacing: { after: 200 }
        })
      );
    }

    // Add grant proposal section
    paragraphs.push(
      new Paragraph({
        text: "Phase 3: Grant Proposal",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200, before: 200 }
      })
    );

    if (data.grantProposal && data.grantProposal !== 'Section pending...') {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.grantProposal,
              size: 24
            })
          ],
          spacing: { after: 200 }
        })
      );
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX: ' + error.message);
  }
};
