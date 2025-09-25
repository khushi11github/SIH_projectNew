/*
 Seed Grade1..Grade12 classes and additional students into excel_data/*.xlsx.
 - Adds classes: C01..C12 named Grade1..Grade12 with subjects from existing subject IDs
 - Adds ~8 students per class with unique IDs
 - Safe to run multiple times (no duplicate IDs)
 Requires: npm i xlsx
*/

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'excel_data');

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function readSheet(filePath){
  if (!fs.existsSync(filePath)) return { rows: [], wsName: 'Sheet1' };
  const wb = XLSX.readFile(filePath);
  const wsName = wb.SheetNames[0];
  const ws = wb.Sheets[wsName];
  return { rows: XLSX.utils.sheet_to_json(ws || {}), wsName };
}

function writeSheet(filePath, rows, wsName='Sheet1'){
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, wsName);
  XLSX.writeFile(wb, filePath);
}

function upsert(rows, getId, toAdd){
  const set = new Set(rows.map(getId));
  toAdd.forEach(r => { const id = getId(r); if (!set.has(id)) rows.push(r); });
  return rows;
}

function pickSubjectsForGrade(gradeNum, available){
  // Cycle through available subject IDs; prefer common core
  const core = ['MATH','ENG','PHY','CHEM','BIO'].filter(id => available.includes(id));
  if (core.length === 0) return available.slice(0, Math.min(3, available.length));
  const out = [];
  // Lower grades: MATH, ENG; Upper: add sciences progressively
  if (available.includes('MATH')) out.push('MATH');
  if (available.includes('ENG')) out.push('ENG');
  if (gradeNum >= 6 && available.includes('PHY')) out.push('PHY');
  if (gradeNum >= 7 && available.includes('BIO')) out.push('BIO');
  if (gradeNum >= 8 && available.includes('CHEM')) out.push('CHEM');
  return Array.from(new Set(out)).slice(0, 4);
}

function seedClasses(){
  const classesFp = path.join(DATA_DIR, 'classes.xlsx');
  const subjectsFp = path.join(DATA_DIR, 'subjects.xlsx');
  const { rows: classRows } = readSheet(classesFp);
  const { rows: subjectRows } = readSheet(subjectsFp);
  const subjectIds = subjectRows.map(r => String(r.id || '').trim()).filter(Boolean);
  const toAdd = [];
  for (let g = 1; g <= 12; g++) {
    const id = `C${String(g).padStart(2,'0')}`;
    const name = `Grade${g}`;
    const room = `R${100 + g}`;
    const subs = pickSubjectsForGrade(g, subjectIds).join(',');
    toAdd.push({ id, name, room, subjects: subs, totalCredits: 0 });
  }
  const out = upsert(classRows, r => String(r.id), toAdd);
  writeSheet(classesFp, out);
}

function seedStudents(){
  const studentsFp = path.join(DATA_DIR, 'students.xlsx');
  const classesFp = path.join(DATA_DIR, 'classes.xlsx');
  const { rows: studentRows } = readSheet(studentsFp);
  const { rows: classRows } = readSheet(classesFp);
  const classIds = classRows.map(r => String(r.id)).filter(Boolean);
  const existing = new Set(studentRows.map(r => String(r.id)));
  let nextId = 2000;
  while (existing.has(String(nextId))) nextId++;
  const names = ['Alex','Blake','Casey','Drew','Emery','Finley','Gray','Harper','Indy','Jules','Kai','Logan'];
  const newStudents = [];
  classIds.forEach((cid, idx) => {
    const perClass = 8; // add 8 students per class
    for (let i = 0; i < perClass; i++) {
      const id = String(nextId++);
      const name = `${names[i % names.length]} ${String.fromCharCode(65 + (idx % 26))}`;
      newStudents.push({ id, name, classId: cid, interests: 'Reading', skillLevel: 3, goals: '' });
    }
  });
  const out = upsert(studentRows, r => String(r.id), newStudents);
  writeSheet(studentsFp, out);
}

function main(){
  ensureDir(DATA_DIR);
  seedClasses();
  seedStudents();
  console.log('Seeded Grade1..Grade12 classes and students into excel_data/.');
}

main();


