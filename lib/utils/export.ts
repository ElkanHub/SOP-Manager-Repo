/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 *
 * @param data Array of flat objects to export
 * @param filename Name of the file to download (without .csv extension)
 */
export function exportToCsv(data: Record<string, any>[], filename: string) {
    if (!data || !data.length) return;

    // 1. Extract headers (keys from the first object)
    const headers = Object.keys(data[0]);

    // 2. Map data to CSV rows
    const csvRows = [];
    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map((header) => {
            const val = row[header];
            // Handle null, undefined
            if (val === null || val === undefined) return '""';

            const strVal = String(val);
            // Escape quotes and wrap in quotes if it contains commas, quotes, or newlines
            if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
                return `"${strVal.replace(/"/g, '""')}"`;
            }
            return `"${strVal}"`;
        });
        csvRows.push(values.join(','));
    }

    // 3. Create blob and download link
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);

    // 4. Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
