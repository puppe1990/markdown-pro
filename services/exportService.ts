
// TypeScript declarations for libraries loaded from CDN
declare var htmlToDocx: any;
declare var jspdf: any;
declare var html2canvas: any;
declare var saveAs: any;

export const exportAsMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, filename);
};

export const exportAsPdf = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('Could not find content to export.');
        return;
    }

    alert('Generating PDF... This may take a moment.');

    const { jsPDF } = jspdf;
    html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, 
      backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        const imgWidth = pdfWidth - 20; // with some margin
        const imgHeight = imgWidth / ratio;
        let heightLeft = imgHeight;
        
        let position = 10; // top margin
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft >= 0) {
            position = -heightLeft - 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight- 20);
        }
        pdf.save(filename);
    }).catch(err => {
        console.error("Error generating PDF:", err);
        alert("An error occurred while generating the PDF.");
    });
};


export const exportAsDocx = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('Could not find content to export.');
        return;
    }
    
    alert('Generating DOCX...');

    // Clone the element and apply specific styles for DOCX export
    const contentClone = element.cloneNode(true) as HTMLElement;
    
    // Convert links to be absolute for DOCX compatibility
    contentClone.querySelectorAll('a').forEach(a => {
        a.href = a.href;
    });

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Content</title></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + contentClone.innerHTML + footer;
    
    try {
      const fileBuffer = await htmlToDocx.asBlob(sourceHTML);
      saveAs(fileBuffer, filename);
    } catch (err) {
      console.error("Error generating DOCX:", err);
      alert("An error occurred while generating the DOCX file.");
    }
};
