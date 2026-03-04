import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

function makeId() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function randDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

function ensureDir(dir: string) {
  return fs.promises.mkdir(dir, { recursive: true });
}

function dbPath() {
  return path.join(process.cwd(), '.data', 'app.db');
}

const firstNames = ['Ana', 'Carlos', 'Maria', 'João', 'Pedro', 'Luíza', 'Gabriel', 'Juliana', 'Marcos', 'Fernanda', 'Rafael', 'Camila', 'Bruno', 'Amanda', 'Felipe', 'Tatiana', 'Eduardo', 'Renata', 'Diego', 'Sofia'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Ferreira', 'Almeida', 'Ribeiro', 'Gomes', 'Martins', 'Carvalho', 'Alves', 'Pereira'];
const streets = ['Rua das Flores', 'Avenida Central', 'Rua do Comércio', 'Rua XV de Novembro', 'Avenida Paulista', 'Rua Augusta', 'Rua da Consolação', 'Avenida Brasil'];
const neighborhoods = ['Centro', 'Bela Vista', 'Liberdade', 'Sé', 'Santa Cecília', 'Mooca', 'Tatuapé', 'Pinheiros', 'Perdizes', 'Moema'];
const cities = ['São Paulo', 'Campinas', 'Guarulhos', 'Osasco', 'Santo André'];
const states = ['SP', 'RJ', 'MG', 'PR', 'SC'];

const schools = ['Escola Municipal A', 'Colégio Estadual B', 'Escola Particular C', 'Instituto de Educação D', 'Escola Estadual E', 'Colégio Particular F'];
const series = ['1º Ano EF', '2º Ano EF', '3º Ano EF', '4º Ano EF', '5º Ano EF', '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF', '1º Ano EM', '2º Ano EM', '3º Ano EM'];
const benefits = ['Bolsa Família', 'Auxílio Brasil', 'Bolsa Escola', 'Auxílio Gás', 'BPC'];
const campaigns = ['Campanha de Natal', 'Dia das Crianças', 'Inverno Solidário', 'Reforma da Biblioteca', 'Projeto Escolar 2024'];

const classNames = ['Informática Básica', 'Reforço Escolar - Matemática', 'Inglês Intermediário', 'Artes Plásticas', 'Robótica Educacional', 'Música e Canto', 'Teatro', 'Xadrez', 'Educação Financeira', 'Comunicação e Oratória'];
const schedules = ['Seg, Qua - 14:00 às 16:00', 'Ter, Qui - 09:00 às 11:00', 'Sex - 14:00 às 17:00', 'Sáb - 09:00 às 12:00'];

const volunteerRoles = ['Eventos', 'Administrativo', 'Manutenção', 'Pedagógico', 'Cultural', 'Esportivo', 'Comunicação', 'Financeiro'];

const donorTypes = ['Empresa', 'Pessoa Física', 'Instituição', 'Governo', 'ONG Parceira'];
const donationMethods = ['Transferência Bancária', 'PIX', 'Boleto', 'Cartão de Crédito', 'Dinheiro'];
const donationTypes = ['Recorrente', 'Única', 'Pontual', 'Campanha Específica'];

const stockCategories = ['Material Escolar', 'Material de Limpeza', 'Material de Escritório', 'Material de Higiene'];
const stockItems = ['Caderno', 'Lápis', 'Borracha', 'Caneta', 'Papel A4', 'Detergente', 'Água Sanitária', 'Pasta', 'Envelope', 'Sabonete', 'Álcool em Gel'];

async function seed300(): Promise<void> {
  const dir = path.dirname(dbPath());
  await ensureDir(dir);

  const db = await open({ filename: dbPath(), driver: sqlite3.Database });
  await db.exec('PRAGMA foreign_keys = ON');

  const t = nowIso();

  await db.exec('BEGIN');
  try {
    await db.run("DELETE FROM attendance_records");
    await db.run("DELETE FROM attendance");
    await db.run("DELETE FROM class_enrollments");
    await db.run("DELETE FROM donations");
    await db.run("DELETE FROM stock_items");
    await db.run("DELETE FROM classes");
    await db.run("DELETE FROM volunteers");
    await db.run("DELETE FROM professors");
    await db.run("DELETE FROM students");
    await db.exec('COMMIT');
  } catch (e) {
    await db.exec('ROLLBACK');
    await db.close();
    throw e;
  }

  const students = Array.from({ length: 300 }, (_, i) => {
    const firstName = randChoice(firstNames);
    const lastName = randChoice(lastNames);
    const birthYear = 2005 + randInt(0, 10);
    const birthMonth = String(randInt(1, 12)).padStart(2, '0');
    const birthDay = String(randInt(1, 28)).padStart(2, '0');
    const birth = `${birthYear}-${birthMonth}-${birthDay}`;

    const guardian = `${randChoice(firstNames)} ${randChoice(lastNames)}`;
    const phone = `(${randInt(10, 99)}) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`;
    const phone2 = Math.random() > 0.7 ? `(${randInt(10, 99)}) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}` : null;

    const cep = `${randInt(10000, 99999)}-${randInt(100, 999)}`;
    const street = randChoice(streets);
    const number = String(randInt(1, 9999));
    const complement = Math.random() > 0.8 ? randChoice(['Apto 101', 'Casa 2', 'Bloco B']) : null;
    const neighborhood = randChoice(neighborhoods);
    const city = randChoice(cities);
    const state = randChoice(states);

    const cpf = `${randInt(100, 999)}.${randInt(100, 999)}.${randInt(100, 999)}-${randInt(10, 99)}`;
    const rg = `${randInt(10000000, 99999999)}-${randChoice(['SP', 'RJ', 'MG'])}`;
    const guardianCpf = `${randInt(100, 999)}.${randInt(100, 999)}.${randInt(100, 999)}-${randInt(10, 99)}`;
    const guardianRg = `${randInt(10000000, 99999999)}-${randChoice(['SP', 'RJ', 'MG'])}`;

    const autorizadoBuscar = Math.random() > 0.3 ? 1 : 0;
    const frequentandoRegularmente = Math.random() > 0.2 ? 1 : 0;
    const jaRepetiuAno = Math.random() > 0.7 ? 1 : 0;
    const recebeBeneficio = Math.random() > 0.4 ? 1 : 0;
    const possuiAlergias = Math.random() > 0.8 ? 1 : 0;
    const usaMedicacao = Math.random() > 0.85 ? 1 : 0;
    const possuiDeficiencia = Math.random() > 0.9 ? 1 : 0;

    const qualBeneficio = recebeBeneficio ? randChoice(benefits) : null;
    const quaisAlergias = possuiAlergias ? randChoice(['Amendoim', 'Frutos do Mar', 'Látex', 'Poeira', 'Pólen']) : null;
    const quaisMedicacoes = usaMedicacao ? randChoice(['Ritalina', 'Insulina', 'Antialérgico', 'Vitamina D']) : null;
    const qualDeficiencia = possuiDeficiencia ? randChoice(['Visual', 'Auditiva', 'Física', 'Intelectual']) : null;

    return {
      id: makeId(),
      enrollment: `MAT-2026-${String(i + 1).padStart(4, '0')}`,
      name: `${firstName} ${lastName}`,
      birth,
      guardian,
      phone,
      avatar: null,
      status: 'active',
      createdAt: t,
      updatedAt: t,
      relationship: randChoice(['Mãe', 'Pai', 'Tia', 'Tio', 'Avó', 'Avô', 'Responsável']),
      phone2,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      cpf,
      rg,
      guardianCpf,
      guardianRg,
      sexo: randChoice(['Masculino', 'Feminino']),
      rede: randChoice(['Pública', 'Privada', 'Municipal', 'Estadual']),
      turno: randChoice(['Manhã', 'Tarde', 'Noite', 'Integral']),
      renda: randChoice(['Até 1 SM', '1 a 2 SM', '2 a 3 SM', '3 a 5 SM', 'Mais de 5 SM']),
      turma: `Turma ${randInt(1, 15)}`,
      nomeSocial: Math.random() > 0.85 ? `${firstName} ${lastName} (Social)` : null,
      nacionalidade: 'Brasileira',
      orgaoEmissor: randChoice(['SSP', 'Detran', 'Receita Federal']),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      autorizadoBuscar,
      escolaAtual: randChoice(schools),
      serieAno: randChoice(series),
      frequentandoRegularmente,
      jaRepetiuAno,
      numeroMoradores: String(randInt(1, 10)),
      recebeBeneficio,
      qualBeneficio,
      situacaoVulnerabilidade: randChoice(['Nenhuma', 'Baixa Renda', 'Deficiência', 'Violência Doméstica', 'Abandono']),
      possuiAlergias,
      quaisAlergias,
      usaMedicacao,
      quaisMedicacoes,
      possuiDeficiencia,
      qualDeficiencia,
      observacoesMedicas: Math.random() > 0.75 ? randChoice(['Uso contínuo de medicamento', 'Restrição alimentar', 'Necessita acompanhamento']) : null,
      contatoEmergenciaNome: `${randChoice(firstNames)} ${randChoice(lastNames)}`,
      contatoEmergenciaTelefone: `(${randInt(10, 99)}) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
      dataEntradaONG: randDate(new Date('2020-01-01'), new Date('2026-12-31')),
      observacoesAdministrativas: Math.random() > 0.7 ? randChoice(['Bom desempenho', 'Necessita apoio', 'Histórico de faltas']) : null,
    };
  });

  const professors = Array.from({ length: 300 }, (_, i) => {
    const firstName = randChoice(firstNames);
    const lastName = randChoice(lastNames);
    const birthYear = 1960 + randInt(0, 25);
    const birthMonth = String(randInt(1, 12)).padStart(2, '0');
    const birthDay = String(randInt(1, 28)).padStart(2, '0');
    const birth = `${birthYear}-${birthMonth}-${birthDay}`;
    const type = randChoice(['Voluntário', 'Horista', 'CLT', 'PJ']);

    return {
      id: makeId(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@escola.edu.br`,
      phone: `(${randInt(10, 99)}) ${randInt(2000, 9999)}-${randInt(1000, 9999)}`,
      cpf: `${randInt(100, 999)}.${randInt(100, 999)}.${randInt(100, 999)}-${randInt(10, 99)}`,
      birth,
      specialization: randChoice(['Matemática', 'Português', 'História', 'Ciências', 'Informática', 'Artes', 'Educação Física', 'Inglês']),
      type,
      hourlyRate: type === 'Horista' ? randFloat(30, 150) : null,
      monthlySalary: type === 'CLT' || type === 'PJ' ? randFloat(2500, 9000) : null,
      avatar: null,
      status: 'active',
      createdAt: t,
      updatedAt: t,
    };
  });

  const volunteers = Array.from({ length: 300 }, (_, i) => {
    const firstName = randChoice(firstNames);
    const lastName = randChoice(lastNames);

    return {
      id: makeId(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@voluntario.org`,
      phone: `(${randInt(10, 99)}) ${randInt(2000, 9999)}-${randInt(1000, 9999)}`,
      role: randChoice(volunteerRoles),
      hours: randInt(0, 500),
      avatar: null,
      status: 'active',
      createdAt: t,
      updatedAt: t,
    };
  });

  const classCodes = Array.from({ length: 300 }, (_, i) => `TUR-2026-${String(i + 1).padStart(4, '0')}`);
  const professorPool = professors.map((p) => p.name);

  const classes = Array.from({ length: 300 }, (_, i) => {
    const startDate = randDate(new Date('2026-01-01'), new Date('2026-06-30'));
    const endDate = Math.random() > 0.3 ? randDate(new Date('2026-07-01'), new Date('2026-12-31')) : null;
    const costPerClass = Math.random() > 0.5 ? randFloat(20, 120) : null;

    return {
      id: makeId(),
      code: classCodes[i],
      name: randChoice(classNames),
      professor: randChoice(professorPool),
      professor_substituto: Math.random() > 0.8 ? randChoice(professorPool) : null,
      schedule: randChoice(schedules),
      startDate,
      endDate,
      costPerClass,
      professorPaymentType: costPerClass ? randChoice(['Por aula', 'Mensal', 'Por projeto']) : null,
      status: 'active',
      currentStudents: 0,
      maxStudents: randInt(15, 30),
      createdAt: t,
      updatedAt: t,
    };
  });

  const donations = Array.from({ length: 300 }, (_, i) => {
    const donor = `${randChoice(donorTypes)} ${randChoice(lastNames)}`;
    const amount = randFloat(10, 5000);
    const date = randDate(new Date('2026-01-01'), new Date('2026-12-31'));

    return {
      id: makeId(),
      donor,
      amount,
      date,
      type: randChoice(donationTypes),
      method: randChoice(donationMethods),
      status: randChoice(['completed', 'pending']),
      campaign: randChoice(campaigns),
      notes: Math.random() > 0.6 ? `Doação ${i + 1}` : null,
      createdAt: t,
      updatedAt: t,
    };
  });

  const stockItems300 = Array.from({ length: 300 }, (_, i) => {
    return {
      id: makeId(),
      name: randChoice(stockItems),
      category: randChoice(stockCategories),
      quantity: randInt(0, 200),
      unit: randChoice(['unidade', 'caixa', 'pacote', 'kg', 'litro']),
      minQuantity: randInt(1, 20),
      notes: Math.random() > 0.7 ? `Item ${i + 1}` : null,
      createdAt: t,
      updatedAt: t,
    };
  });

  await db.exec('BEGIN');
  try {
    const studentCols = [
      'id', 'enrollment', 'name', 'birth', 'guardian', 'phone', 'avatar', 'status', 'createdAt', 'updatedAt',
      'relationship', 'phone2', 'cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'state',
      'cpf', 'rg', 'guardianCpf', 'guardianRg', 'sexo', 'rede', 'turno', 'renda', 'turma', 'nomeSocial',
      'nacionalidade', 'orgaoEmissor', 'email', 'autorizadoBuscar', 'escolaAtual', 'serieAno',
      'frequentandoRegularmente', 'jaRepetiuAno', 'numeroMoradores', 'recebeBeneficio', 'qualBeneficio',
      'situacaoVulnerabilidade', 'possuiAlergias', 'quaisAlergias', 'usaMedicacao', 'quaisMedicacoes',
      'possuiDeficiencia', 'qualDeficiencia', 'observacoesMedicas', 'contatoEmergenciaNome',
      'contatoEmergenciaTelefone', 'dataEntradaONG', 'observacoesAdministrativas'
    ];
    const studentPlaceholders = studentCols.map(() => '?').join(', ');
    const studentSql = `INSERT INTO students (${studentCols.join(', ')}) VALUES (${studentPlaceholders})`;

    for (const s of students) {
      await db.run(studentSql, studentCols.map((c) => (s as any)[c]));
    }

    for (const p of professors) {
      await db.run(
        `INSERT INTO professors (id, name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.email, p.phone, p.cpf, p.birth, p.specialization, p.type, p.hourlyRate, p.monthlySalary, p.avatar, p.status, p.createdAt, p.updatedAt]
      );
    }

    for (const v of volunteers) {
      await db.run(
        `INSERT INTO volunteers (id, name, email, phone, role, hours, avatar, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.name, v.email, v.phone, v.role, v.hours, v.avatar, v.status, v.createdAt, v.updatedAt]
      );
    }

    for (const c of classes) {
      await db.run(
        `INSERT INTO classes (id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.code, c.name, c.professor, c.professor_substituto, c.schedule, c.startDate, c.endDate, c.costPerClass, c.professorPaymentType, c.status, c.currentStudents, c.maxStudents, c.createdAt, c.updatedAt]
      );
    }

    for (const d of donations) {
      await db.run(
        `INSERT INTO donations (id, donor, amount, date, type, method, status, campaign, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.id, d.donor, d.amount, d.date, d.type, d.method, d.status, d.campaign, d.notes, d.createdAt, d.updatedAt]
      );
    }

    for (const it of stockItems300) {
      await db.run(
        `INSERT INTO stock_items (id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [it.id, it.name, it.category, it.quantity, it.unit, it.minQuantity, it.notes, it.createdAt, it.updatedAt]
      );
    }

    await db.exec('COMMIT');
  } catch (e) {
    await db.exec('ROLLBACK');
    await db.close();
    throw e;
  }

  const enrollmentCount = Math.min(300, students.length, classes.length);
  await db.exec('BEGIN');
  try {
    for (let i = 0; i < enrollmentCount; i++) {
      await db.run(
        "INSERT INTO class_enrollments (id, classId, studentId, entryDate, exitDate, status) VALUES (?, ?, ?, ?, NULL, 'active')",
        [makeId(), classes[i % classes.length].id, students[i].id, randDate(new Date('2026-01-01'), new Date('2026-12-31'))]
      );
    }

    for (const cls of classes) {
      await db.run(
        "UPDATE classes SET currentStudents = (SELECT COUNT(1) FROM class_enrollments WHERE classId = ? AND status = 'active'), updatedAt = ? WHERE id = ?",
        [cls.id, nowIso(), cls.id]
      );
    }

    await db.exec('COMMIT');
  } catch (e) {
    await db.exec('ROLLBACK');
    await db.close();
    throw e;
  }

  console.log('Seed 300 concluído.');
  await db.close();
}

seed300().catch((e) => {
  console.error(e);
  process.exit(1);
});
