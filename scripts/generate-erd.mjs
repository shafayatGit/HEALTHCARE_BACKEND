/**
 * Generates public/ERD.svg from Prisma schema definitions.
 * Table-style ERD (PK | Field | Type | Constraint) matching draw.io layout.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/ERD.svg");

/** @type {Record<string, { x: number; y: number; table: string; fields: Array<{ key?: string; name: string; type: string; constraint?: string }> }>} */
const entities = {
  Verification: {
    x: 40,
    y: 40,
    table: "verification",
    fields: [
      { key: "PK", name: "id", type: "String" },
      { name: "identifier", type: "String" },
      { name: "value", type: "String" },
      { name: "expiresAt", type: "DateTime" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  Session: {
    x: 340,
    y: 40,
    table: "session",
    fields: [
      { key: "PK", name: "id", type: "String" },
      { name: "expiresAt", type: "DateTime" },
      { name: "token", type: "String", constraint: "unique" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { name: "ipAddress", type: "String?", constraint: "nullable" },
      { name: "userAgent", type: "String?", constraint: "nullable" },
      { key: "FK", name: "userId", type: "String", constraint: "→ User" },
    ],
  },
  User: {
    x: 680,
    y: 40,
    table: "user",
    fields: [
      { key: "PK", name: "id", type: "String" },
      { name: "name", type: "String" },
      { name: "email", type: "String", constraint: "unique" },
      { name: "emailVerified", type: "Boolean", constraint: "default false" },
      { name: "role", type: "Role", constraint: "default PATIENT" },
      { name: "status", type: "UserStatus", constraint: "default ACTIVE" },
      { name: "needPasswordChange", type: "Boolean", constraint: "default false" },
      { name: "isDeleted", type: "Boolean", constraint: "default false" },
      { name: "deletedAt", type: "DateTime?", constraint: "nullable" },
      { name: "image", type: "String?", constraint: "nullable" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  Account: {
    x: 1040,
    y: 40,
    table: "account",
    fields: [
      { key: "PK", name: "id", type: "String" },
      { name: "accountId", type: "String" },
      { name: "providerId", type: "String" },
      { key: "FK", name: "userId", type: "String", constraint: "→ User" },
      { name: "accessToken", type: "String?", constraint: "nullable" },
      { name: "refreshToken", type: "String?", constraint: "nullable" },
      { name: "idToken", type: "String?", constraint: "nullable" },
      { name: "accessTokenExpiresAt", type: "DateTime?", constraint: "nullable" },
      { name: "refreshTokenExpiresAt", type: "DateTime?", constraint: "nullable" },
      { name: "scope", type: "String?", constraint: "nullable" },
      { name: "password", type: "String?", constraint: "nullable" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  Admin: {
    x: 40,
    y: 420,
    table: "admins",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "name", type: "String" },
      { name: "email", type: "String", constraint: "unique" },
      { name: "profilePhoto", type: "String?", constraint: "nullable" },
      { name: "contactNumber", type: "String?", constraint: "nullable" },
      { name: "isDeleted", type: "Boolean", constraint: "default false" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { name: "deletedAt", type: "DateTime?", constraint: "nullable" },
      { key: "FK", name: "userId", type: "String", constraint: "unique → User" },
    ],
  },
  Patient: {
    x: 380,
    y: 420,
    table: "patient",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "name", type: "String" },
      { name: "email", type: "String", constraint: "unique" },
      { name: "profilePhoto", type: "String?", constraint: "nullable" },
      { name: "contactNumber", type: "String?", constraint: "nullable" },
      { name: "address", type: "String?", constraint: "nullable" },
      { name: "isDeleted", type: "Boolean", constraint: "default false" },
      { name: "deletedAt", type: "DateTime?", constraint: "nullable" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { key: "FK", name: "userId", type: "String", constraint: "unique → User" },
    ],
  },
  Doctor: {
    x: 720,
    y: 420,
    table: "doctor",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "name", type: "String" },
      { name: "email", type: "String", constraint: "unique" },
      { name: "profilePhoto", type: "String?", constraint: "nullable" },
      { name: "contactNumber", type: "String?", constraint: "nullable" },
      { name: "address", type: "String?", constraint: "nullable" },
      { name: "isDeleted", type: "Boolean", constraint: "default false" },
      { name: "deletedAt", type: "DateTime?", constraint: "nullable" },
      { name: "registrationNumber", type: "String", constraint: "unique" },
      { name: "experience", type: "Int", constraint: "default 0" },
      { name: "gender", type: "Gender" },
      { name: "appointmentFee", type: "Float" },
      { name: "qualification", type: "String" },
      { name: "currentWorkingPlace", type: "String" },
      { name: "designation", type: "String" },
      { name: "averageRating", type: "Float", constraint: "default 0.0" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { key: "FK", name: "userId", type: "String", constraint: "unique → User" },
    ],
  },
  Speciality: {
    x: 1120,
    y: 420,
    table: "specialties",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "title", type: "String", constraint: "unique VarChar(100)" },
      { name: "description", type: "String?", constraint: "Text nullable" },
      { name: "icon", type: "String?", constraint: "nullable" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { name: "isDeleted", type: "Boolean", constraint: "default false" },
      { name: "deletedAt", type: "DateTime?", constraint: "nullable" },
    ],
  },
  DoctorSpeciality: {
    x: 1120,
    y: 720,
    table: "doctor_specialities",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { key: "FK", name: "doctorId", type: "String", constraint: "→ Doctor" },
      { key: "FK", name: "specialtyId", type: "String", constraint: "→ Speciality" },
    ],
  },
  Schedule: {
    x: 40,
    y: 900,
    table: "schedules",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "startDateTime", type: "DateTime" },
      { name: "endDateTime", type: "DateTime" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  DoctorSchedules: {
    x: 340,
    y: 900,
    table: "doctor_schedules",
    fields: [
      { key: "PK", name: "doctorId", type: "String", constraint: "composite PK" },
      { key: "PK", name: "scheduleId", type: "String", constraint: "composite PK" },
      { name: "isBooked", type: "Boolean", constraint: "default false" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  Appointment: {
    x: 640,
    y: 900,
    table: "appointments",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "videoCallingId", type: "Uuid", constraint: "unique" },
      { name: "status", type: "AppointmentStatus", constraint: "default SCHEDULED" },
      { name: "paymentStatus", type: "PaymentStatus", constraint: "default UNPAID" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { key: "FK", name: "patientId", type: "String", constraint: "→ Patient" },
      { key: "FK", name: "doctorId", type: "String", constraint: "→ Doctor" },
      { key: "FK", name: "scheduleId", type: "String", constraint: "→ Schedule" },
    ],
  },
  Prescription: {
    x: 40,
    y: 1280,
    table: "prescriptions",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "followUpDate", type: "DateTime" },
      { name: "instructions", type: "String", constraint: "Text" },
      { name: "pdfUrl", type: "String?", constraint: "nullable" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { key: "FK", name: "appointmentId", type: "String", constraint: "unique → Appointment" },
      { key: "FK", name: "patientId", type: "String", constraint: "→ Patient" },
      { key: "FK", name: "doctorId", type: "String", constraint: "→ Doctor" },
    ],
  },
  Payment: {
    x: 380,
    y: 1280,
    table: "payments",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "amount", type: "Float" },
      { name: "transactionId", type: "Uuid", constraint: "unique" },
      { name: "stripeEventId", type: "String?", constraint: "unique nullable" },
      { name: "status", type: "PaymentStatus", constraint: "default UNPAID" },
      { name: "invoiceUrl", type: "String?", constraint: "nullable" },
      { name: "paymentGatewayData", type: "Json?", constraint: "nullable" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { key: "FK", name: "appointmentId", type: "String", constraint: "unique → Appointment" },
    ],
  },
  Review: {
    x: 720,
    y: 1280,
    table: "reviews",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "rating", type: "Float", constraint: "default 0.0" },
      { name: "comment", type: "String?", constraint: "Text nullable" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { key: "FK", name: "appointmentId", type: "String", constraint: "unique → Appointment" },
      { key: "FK", name: "patientId", type: "String", constraint: "→ Patient" },
      { key: "FK", name: "doctorId", type: "String", constraint: "→ Doctor" },
    ],
  },
  MedicalReport: {
    x: 1060,
    y: 1280,
    table: "medical_reports",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "reportName", type: "String" },
      { name: "reportLink", type: "String" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { key: "FK", name: "patientId", type: "String", constraint: "→ Patient" },
    ],
  },
  PatientHealthData: {
    x: 380,
    y: 1620,
    table: "patient_health_data",
    fields: [
      { key: "PK", name: "id", type: "String", constraint: "uuid(7)" },
      { name: "gender", type: "Gender" },
      { name: "dateOfBirth", type: "DateTime" },
      { name: "bloodGroup", type: "BloodGroup" },
      { name: "hasAllergies", type: "Boolean", constraint: "default false" },
      { name: "hasDiabetes", type: "Boolean", constraint: "default false" },
      { name: "height", type: "String" },
      { name: "weight", type: "String" },
      { name: "smokingStatus", type: "Boolean", constraint: "default false" },
      { name: "dietaryPreferences", type: "String?", constraint: "nullable" },
      { name: "pregnancyStatus", type: "Boolean", constraint: "default false" },
      { name: "mentalHealthHistory", type: "String?", constraint: "nullable" },
      { name: "immunizationStatus", type: "String?", constraint: "nullable" },
      { name: "hasPastSurgeries", type: "Boolean", constraint: "default false" },
      { name: "recentAnxiety", type: "Boolean", constraint: "default false" },
      { name: "recentDepression", type: "Boolean", constraint: "default false" },
      { name: "maritalStatus", type: "String?", constraint: "nullable" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
      { key: "FK", name: "patientId", type: "String", constraint: "unique → Patient" },
    ],
  },
};

const relationships = [
  { from: "User", to: "Session", fromSide: "1", toSide: "N" },
  { from: "User", to: "Account", fromSide: "1", toSide: "N" },
  { from: "User", to: "Admin", fromSide: "1", toSide: "1" },
  { from: "User", to: "Patient", fromSide: "1", toSide: "1" },
  { from: "User", to: "Doctor", fromSide: "1", toSide: "1" },
  { from: "Doctor", to: "DoctorSpeciality", fromSide: "1", toSide: "N" },
  { from: "Speciality", to: "DoctorSpeciality", fromSide: "1", toSide: "N" },
  { from: "Doctor", to: "DoctorSchedules", fromSide: "1", toSide: "N" },
  { from: "Schedule", to: "DoctorSchedules", fromSide: "1", toSide: "N" },
  { from: "Patient", to: "Appointment", fromSide: "1", toSide: "N" },
  { from: "Doctor", to: "Appointment", fromSide: "1", toSide: "N" },
  { from: "Schedule", to: "Appointment", fromSide: "1", toSide: "N" },
  { from: "Appointment", to: "Prescription", fromSide: "1", toSide: "1" },
  { from: "Appointment", to: "Payment", fromSide: "1", toSide: "1" },
  { from: "Appointment", to: "Review", fromSide: "1", toSide: "1" },
  { from: "Patient", to: "MedicalReport", fromSide: "1", toSide: "N" },
  { from: "Patient", to: "PatientHealthData", fromSide: "1", toSide: "1" },
  { from: "Patient", to: "Prescription", fromSide: "1", toSide: "N" },
  { from: "Doctor", to: "Prescription", fromSide: "1", toSide: "N" },
  { from: "Patient", to: "Review", fromSide: "1", toSide: "N" },
  { from: "Doctor", to: "Review", fromSide: "1", toSide: "N" },
];

const W = 300;
const ROW_H = 22;
const HEADER_H = 34;
const COL_KEY = 36;
const COL_NAME = 118;
const COL_TYPE = 88;
const COL_CONSTRAINT = 58;

function entityHeight(fieldCount) {
  return HEADER_H + fieldCount * ROW_H + 8;
}

function entityCenter(name) {
  const e = entities[name];
  const h = entityHeight(e.fields.length);
  return { cx: e.x + W / 2, cy: e.y + h / 2, h, w: W };
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEntity(name, config) {
  const { x, y, table, fields } = config;
  const h = entityHeight(fields.length);
  const lines = [];

  lines.push(`<g id="entity-${name}" transform="translate(${x},${y})">`);
  lines.push(
    `<rect width="${W}" height="${h}" rx="4" fill="#fff" stroke="#1a1a2e" stroke-width="1.5" filter="url(#cardShadow)"/>`
  );
  lines.push(`<rect width="${W}" height="${HEADER_H}" rx="4" fill="#1e3a5f"/>`);
  lines.push(`<rect y="${HEADER_H - 8}" width="${W}" height="8" fill="#1e3a5f"/>`);
  lines.push(
    `<text x="${W / 2}" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="Segoe UI, system-ui, sans-serif">${escapeXml(name)}</text>`
  );
  lines.push(
    `<text x="${W - 8}" y="22" text-anchor="end" font-size="9" fill="#93c5fd" font-family="monospace">${escapeXml(table)}</text>`
  );

  // Column headers
  const hy = HEADER_H;
  lines.push(`<line x1="0" y1="${hy}" x2="${W}" y2="${hy}" stroke="#cbd5e1"/>`);
  lines.push(`<rect y="${hy}" width="${W}" height="${ROW_H}" fill="#f1f5f9"/>`);
  [
    [4, "Key", 10],
    [COL_KEY + 4, "Field", 10],
    [COL_KEY + COL_NAME + 4, "Type", 10],
    [COL_KEY + COL_NAME + COL_TYPE + 4, "Constraint", 10],
  ].forEach(([tx, label, fs]) => {
    lines.push(
      `<text x="${tx}" y="${hy + 15}" font-size="${fs}" font-weight="600" fill="#475569" font-family="Segoe UI, system-ui, sans-serif">${label}</text>`
    );
  });

  fields.forEach((field, i) => {
    const ry = hy + ROW_H + i * ROW_H;
    const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
    const isFk = field.key === "FK";
    lines.push(`<rect y="${ry}" width="${W}" height="${ROW_H}" fill="${isFk ? "#fff7ed" : bg}"/>`);
    lines.push(`<line x1="0" y1="${ry}" x2="${W}" y2="${ry}" stroke="#e2e8f0"/>`);

    if (field.key) {
      const keyColor = field.key === "PK" ? "#b45309" : "#c2410c";
      lines.push(
        `<text x="8" y="${ry + 15}" font-size="10" font-weight="700" fill="${keyColor}" font-family="Segoe UI, sans-serif">${field.key}</text>`
      );
    }

    const nameX = COL_KEY + 6;
    const nameStyle =
      field.key === "PK"
        ? ' font-weight="600" fill="#1e40af"'
        : field.key === "FK"
          ? ' font-weight="600" fill="#9a3412"'
          : ' fill="#1e293b"';

    lines.push(
      `<text x="${nameX}" y="${ry + 15}" font-size="11"${nameStyle} font-family="Consolas, monospace">${escapeXml(field.name)}</text>`
    );
    lines.push(
      `<text x="${COL_KEY + COL_NAME + 4}" y="${ry + 15}" font-size="10" fill="#64748b" font-family="Consolas, monospace">${escapeXml(field.type)}</text>`
    );
    if (field.constraint) {
      lines.push(
        `<text x="${COL_KEY + COL_NAME + COL_TYPE + 4}" y="${ry + 15}" font-size="9" fill="#94a3b8" font-family="Segoe UI, sans-serif">${escapeXml(field.constraint)}</text>`
      );
    }
  });

  lines.push(`</g>`);
  return { svg: lines.join("\n"), h };
}

function renderRelationship(rel) {
  const a = entityCenter(rel.from);
  const b = entityCenter(rel.to);
  const x1 = a.cx;
  const y1 = a.cy;
  const x2 = b.cx;
  const y2 = b.cy;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return `<g class="rel">
    <path d="M ${x1} ${y1} Q ${mx} ${y1} ${mx} ${my} T ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrow)"/>
    <text x="${mx + 4}" y="${my - 4}" font-size="9" fill="#475569" font-weight="600" font-family="Segoe UI, sans-serif">${rel.fromSide}:${rel.toSide}</text>
  </g>`;
}

const enumsBlock = `
<g transform="translate(1060, 1620)">
  <rect width="360" height="320" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" filter="url(#cardShadow)"/>
  <rect width="360" height="32" rx="6" fill="#334155"/>
  <rect y="24" width="360" height="8" fill="#334155"/>
  <text x="180" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Segoe UI, sans-serif">Enums</text>
  <text x="12" y="52" font-size="11" font-weight="700" fill="#0f172a" font-family="Segoe UI, sans-serif">Role</text>
  <text x="12" y="68" font-size="10" fill="#475569" font-family="monospace">SUPER_ADMIN | ADMIN | DOCTOR | PATIENT</text>
  <text x="12" y="92" font-size="11" font-weight="700" fill="#0f172a" font-family="Segoe UI, sans-serif">UserStatus</text>
  <text x="12" y="108" font-size="10" fill="#475569" font-family="monospace">BLOCKED | DELETED | ACTIVE</text>
  <text x="12" y="132" font-size="11" font-weight="700" fill="#0f172a" font-family="Segoe UI, sans-serif">Gender</text>
  <text x="12" y="148" font-size="10" fill="#475569" font-family="monospace">MALE | FEMALE</text>
  <text x="12" y="172" font-size="11" font-weight="700" fill="#0f172a" font-family="Segoe UI, sans-serif">BloodGroup</text>
  <text x="12" y="188" font-size="10" fill="#475569" font-family="monospace">A± B± AB± O± (8 values)</text>
  <text x="12" y="212" font-size="11" font-weight="700" fill="#0f172a" font-family="Segoe UI, sans-serif">AppointmentStatus</text>
  <text x="12" y="228" font-size="10" fill="#475569" font-family="monospace">SCHEDULED | INPROGRESS | COMPLETED | CANCELED</text>
  <text x="12" y="252" font-size="11" font-weight="700" fill="#0f172a" font-family="Segoe UI, sans-serif">PaymentStatus</text>
  <text x="12" y="268" font-size="10" fill="#475569" font-family="monospace">PAID | UNPAID</text>
  <line x1="12" y1="284" x2="348" y2="284" stroke="#e2e8f0"/>
  <text x="12" y="304" font-size="10" fill="#64748b" font-family="Segoe UI, sans-serif">Generated from prisma/schema/*.prisma</text>
</g>`;

const entitySvgs = Object.entries(entities).map(([name, cfg]) => renderEntity(name, cfg).svg);
const relSvgs = relationships.map(renderRelationship);

const svgWidth = 1480;
const svgHeight = 1980;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <defs>
    <filter id="cardShadow" x="-4%" y="-4%" width="108%" height="108%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.1"/>
    </filter>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#64748b"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="${svgWidth / 2}" y="28" text-anchor="middle" font-size="20" font-weight="700" fill="#0f172a" font-family="Segoe UI, system-ui, sans-serif">Healthcare Backend — Entity Relationship Diagram</text>
  <text x="${svgWidth / 2}" y="50" text-anchor="middle" font-size="12" fill="#64748b" font-family="Segoe UI, sans-serif">All attributes · PostgreSQL · Prisma</text>
  <g id="relationships">${relSvgs.join("\n")}</g>
  <g id="entities">${entitySvgs.join("\n")}</g>
  ${enumsBlock}
</svg>`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg, "utf8");
console.log(`Written ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
