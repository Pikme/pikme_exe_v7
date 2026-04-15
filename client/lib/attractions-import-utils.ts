/**
 * Attractions CSV Import Utilities
 * Handles parsing and validation of attractions CSV files
 */

export interface AttractionImportRow {
  name: string;
  type: string;
  address: string;
  cityId: string;
  description?: string;
  rating?: number;
  openingHours?: string;
  entryFee?: string;
  estimatedVisitTime?: string;
  highlights?: string[];
  phone?: string;
  email?: string;
  website?: string;
}

export interface ImportError {
  row: number;
  field: string;
  error: string;
  value?: string;
}

const VALID_TYPES = [
  "landmark",
  "restaurant",
  "museum",
  "temple",
  "monument",
  "park",
  "cafe",
  "shopping",
  "other",
];

/**
 * Parse CSV text into rows
 */
export function parseCSV(csvText: string): string[][] {
  const lines = csvText.trim().split("\n");
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    if (current) {
      row.push(current.trim());
    }

    if (row.some((cell) => cell)) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Validate a single attraction row
 */
export function validateAttractionRow(
  row: string[],
  rowIndex: number,
  headers: string[]
): { data?: AttractionImportRow; errors: ImportError[] } {
  const errors: ImportError[] = [];
  const data: Partial<AttractionImportRow> = {};

  // Map headers to values
  const rowData: Record<string, string> = {};
  headers.forEach((header, index) => {
    rowData[header.toLowerCase()] = row[index] || "";
  });

  // Validate required fields
  const name = rowData["name"]?.trim();
  if (!name) {
    errors.push({
      row: rowIndex,
      field: "name",
      error: "Name is required",
    });
  } else {
    data.name = name;
  }

  const type = rowData["type"]?.trim().toLowerCase();
  if (!type) {
    errors.push({
      row: rowIndex,
      field: "type",
      error: "Type is required",
    });
  } else if (!VALID_TYPES.includes(type)) {
    errors.push({
      row: rowIndex,
      field: "type",
      error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
      value: type,
    });
  } else {
    data.type = type;
  }

  const address = rowData["address"]?.trim();
  if (!address) {
    errors.push({
      row: rowIndex,
      field: "address",
      error: "Address is required",
    });
  } else {
    data.address = address;
  }

  const cityId = rowData["city id"]?.trim() || rowData["cityid"]?.trim();
  if (!cityId) {
    errors.push({
      row: rowIndex,
      field: "cityId",
      error: "City ID is required",
    });
  } else {
    data.cityId = cityId;
  }

  // Optional fields
  const description = rowData["description"]?.trim();
  if (description) {
    data.description = description;
  }

  const rating = rowData["rating"]?.trim();
  if (rating) {
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      errors.push({
        row: rowIndex,
        field: "rating",
        error: "Rating must be a number between 0 and 5",
        value: rating,
      });
    } else {
      data.rating = ratingNum;
    }
  }

  const openingHours = rowData["opening hours"]?.trim() || rowData["openinghours"]?.trim();
  if (openingHours) {
    data.openingHours = openingHours;
  }

  const entryFee = rowData["entry fee"]?.trim() || rowData["entryfee"]?.trim();
  if (entryFee) {
    data.entryFee = entryFee;
  }

  const visitTime = rowData["estimated visit time"]?.trim() || rowData["estimatedvisittime"]?.trim();
  if (visitTime) {
    data.estimatedVisitTime = visitTime;
  }

  const highlights = rowData["highlights"]?.trim();
  if (highlights) {
    data.highlights = highlights.split(",").map((h) => h.trim());
  }

  const phone = rowData["phone"]?.trim();
  if (phone) {
    data.phone = phone;
  }

  const email = rowData["email"]?.trim();
  if (email) {
    if (!isValidEmail(email)) {
      errors.push({
        row: rowIndex,
        field: "email",
        error: "Invalid email format",
        value: email,
      });
    } else {
      data.email = email;
    }
  }

  const website = rowData["website"]?.trim();
  if (website) {
    if (!isValidUrl(website)) {
      errors.push({
        row: rowIndex,
        field: "website",
        error: "Invalid URL format",
        value: website,
      });
    } else {
      data.website = website;
    }
  }

  return {
    data: errors.length === 0 ? (data as AttractionImportRow) : undefined,
    errors,
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse and validate attractions CSV file
 */
export function parseAttractionsCSV(
  csvText: string
): {
  validRows: AttractionImportRow[];
  errors: ImportError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
} {
  const rows = parseCSV(csvText);

  if (rows.length === 0) {
    return {
      validRows: [],
      errors: [{ row: 1, field: "file", error: "CSV file is empty" }],
      summary: { total: 0, valid: 0, invalid: 0 },
    };
  }

  // First row is headers
  const headers = rows[0];
  const requiredHeaders = ["name", "type", "address", "city id"];
  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.some((h) => h.toLowerCase().includes(header.toLowerCase()))
  );

  if (missingHeaders.length > 0) {
    return {
      validRows: [],
      errors: [
        {
          row: 1,
          field: "headers",
          error: `Missing required headers: ${missingHeaders.join(", ")}`,
        },
      ],
      summary: { total: 0, valid: 0, invalid: 0 },
    };
  }

  const validRows: AttractionImportRow[] = [];
  const errors: ImportError[] = [];

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Skip empty rows
    if (!row.some((cell) => cell)) {
      continue;
    }

    const { data, errors: rowErrors } = validateAttractionRow(row, i + 1, headers);

    if (data) {
      validRows.push(data);
    } else {
      errors.push(...rowErrors);
    }
  }

  return {
    validRows,
    errors,
    summary: {
      total: rows.length - 1,
      valid: validRows.length,
      invalid: errors.length > 0 ? rows.length - 1 - validRows.length : 0,
    },
  };
}

/**
 * Generate sample CSV template
 */
export function generateAttractionsCSVTemplate(): string {
  const headers = [
    "Name",
    "Type",
    "Address",
    "City ID",
    "Description",
    "Rating",
    "Opening Hours",
    "Entry Fee",
    "Estimated Visit Time",
    "Highlights",
    "Phone",
    "Email",
    "Website",
  ];

  const samples = [
    [
      "Taj Mahal",
      "monument",
      "Agra, Uttar Pradesh",
      "1",
      "Iconic white marble mausoleum built by Mughal Emperor Shah Jahan",
      "4.8",
      "6:00 AM - 7:00 PM",
      "₹250 (Indian), ₹500 (Foreign)",
      "2-3 hours",
      "UNESCO World Heritage, Marble inlay, Symmetrical design",
      "+91-562-2226431",
      "info@tajmahal.gov.in",
      "https://www.tajmahal.gov.in",
    ],
    [
      "Agra Fort",
      "landmark",
      "Agra, Uttar Pradesh",
      "1",
      "Historic Mughal fort with red sandstone walls",
      "4.6",
      "6:00 AM - 4:30 PM",
      "₹300 (Indian), ₹500 (Foreign)",
      "2 hours",
      "Red sandstone, Mughal architecture, River views",
      "+91-562-2226002",
      "info@agrafort.gov.in",
      "https://www.agrafort.gov.in",
    ],
    [
      "Kailash Temple",
      "temple",
      "Agra, Uttar Pradesh",
      "1",
      "Ancient Hindu temple dedicated to Lord Shiva",
      "4.7",
      "6:00 AM - 9:00 PM",
      "Free",
      "1 hour",
      "Intricate stone carvings, Spiritual atmosphere, Morning prayers",
      "+91-562-2224455",
      "temple@kailash.org",
      "https://www.kailashtemple.org",
    ],
  ];

  const rows = [headers, ...samples];
  return rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}
