import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  const statusFilter = searchParams.get('status');
  const q = searchParams.get('q');
  
  const db = await getDb();
  
  const whereParts: string[] = [];
  const whereParams: any[] = [];

  if (statusFilter) {
    whereParts.push('status = ?');
    whereParams.push(statusFilter);
  }

  if (q && q.trim() !== '') {
    whereParts.push('(LOWER(name) LIKE ? OR enrollment LIKE ?)');
    const like = `%${q.trim().toLowerCase()}%`;
    whereParams.push(like, like);
  }

  const where = whereParts.length ? ` WHERE ${whereParts.join(' AND ')}` : '';

  const count = await db.get(`SELECT COUNT(*) as total FROM students${where}`, whereParams);
  const students = await db.all(
    `SELECT id, enrollment, name, nomeSocial, birth, guardian, relationship, phone, phone2, avatar, status,
      cep, street, number, complement, neighborhood, city, state,
      cpf, rg, guardianCpf, guardianRg,
      sexo, rede, turno, renda, turma,
      nacionalidade, orgaoEmissor, email, autorizadoBuscar,
      escolaAtual, serieAno, frequentandoRegularmente, jaRepetiuAno,
      numeroMoradores, recebeBeneficio, qualBeneficio, situacaoVulnerabilidade,
      possuiAlergias, quaisAlergias, usaMedicacao, quaisMedicacoes,
      possuiDeficiencia, qualDeficiencia, observacoesMedicas,
      contatoEmergenciaNome, contatoEmergenciaTelefone, dataEntradaONG, observacoesAdministrativas,
      createdAt, updatedAt 
     FROM students${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...whereParams, limit, offset]
  );
  
  return NextResponse.json({ 
    students,
    pagination: {
      page,
      limit,
      total: count.total,
      totalPages: Math.ceil(count.total / limit)
    }
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    enrollment?: string;
    name?: string;
    birth?: string;
    guardian?: string;
    relationship?: string;
    phone?: string;
    phone2?: string;
    avatar?: string;
    status?: 'active' | 'inactive' | 'dropout' | 'completed';
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cpf?: string;
    rg?: string;
    guardianCpf?: string;
    guardianRg?: string;
    sexo?: string;
    rede?: string;
    turno?: string;
    renda?: string;
    turma?: string;
    nomeSocial?: string;
    nacionalidade?: string;
    orgaoEmissor?: string;
    email?: string;
    autorizadoBuscar?: boolean;
    escolaAtual?: string;
    serieAno?: string;
    frequentandoRegularmente?: boolean;
    jaRepetiuAno?: boolean;
    numeroMoradores?: string;
    recebeBeneficio?: boolean;
    qualBeneficio?: string;
    situacaoVulnerabilidade?: string;
    possuiAlergias?: boolean;
    quaisAlergias?: string;
    usaMedicacao?: boolean;
    quaisMedicacoes?: string;
    possuiDeficiencia?: boolean;
    qualDeficiencia?: string;
    observacoesMedicas?: string;
    contatoEmergenciaNome?: string;
    contatoEmergenciaTelefone?: string;
    dataEntradaONG?: string;
    observacoesAdministrativas?: string;
  };

  if (!body?.enrollment || !body?.name) {
    return NextResponse.json({ error: 'enrollment and name are required' }, { status: 400 });
  }

  const db = await getDb();

  const enrollment = body.enrollment;
  const name = body.name;

  const birth = typeof body.birth === 'string' ? body.birth : null;
  const guardian = typeof body.guardian === 'string' ? body.guardian : null;
  const relationship = typeof body.relationship === 'string' ? body.relationship : null;
  const phone = typeof body.phone === 'string' ? body.phone : null;
  const phone2 = typeof body.phone2 === 'string' ? body.phone2 : null;
  const avatar = typeof body.avatar === 'string' ? body.avatar : null;
  const status = (body.status as any) ?? 'active';
  
  const cep = typeof body.cep === 'string' ? body.cep : null;
  const street = typeof body.street === 'string' ? body.street : null;
  const number = typeof body.number === 'string' ? body.number : null;
  const complement = typeof body.complement === 'string' ? body.complement : null;
  const neighborhood = typeof body.neighborhood === 'string' ? body.neighborhood : null;
  const city = typeof body.city === 'string' ? body.city : null;
  const state = typeof body.state === 'string' ? body.state : null;
  
  const cpf = typeof body.cpf === 'string' ? body.cpf : null;
  const rg = typeof body.rg === 'string' ? body.rg : null;
  const guardianCpf = typeof body.guardianCpf === 'string' ? body.guardianCpf : null;
  const guardianRg = typeof body.guardianRg === 'string' ? body.guardianRg : null;
  
  const sexo = typeof body.sexo === 'string' ? body.sexo : null;
  const rede = typeof body.rede === 'string' ? body.rede : null;
  const turno = typeof body.turno === 'string' ? body.turno : null;
  const renda = typeof body.renda === 'string' ? body.renda : null;
  const turma = typeof body.turma === 'string' ? body.turma : null;
  
  const nomeSocial = typeof body.nomeSocial === 'string' ? body.nomeSocial : null;
  const nacionalidade = typeof body.nacionalidade === 'string' ? body.nacionalidade : 'Brasileira';
  const orgaoEmissor = typeof body.orgaoEmissor === 'string' ? body.orgaoEmissor : null;
  const email = typeof body.email === 'string' ? body.email : null;
  const autorizadoBuscar = typeof body.autorizadoBuscar === 'boolean' ? body.autorizadoBuscar : false;
  const escolaAtual = typeof body.escolaAtual === 'string' ? body.escolaAtual : null;
  const serieAno = typeof body.serieAno === 'string' ? body.serieAno : null;
  const frequentandoRegularmente = typeof body.frequentandoRegularmente === 'boolean' ? body.frequentandoRegularmente : true;
  const jaRepetiuAno = typeof body.jaRepetiuAno === 'boolean' ? body.jaRepetiuAno : false;
  const numeroMoradores = typeof body.numeroMoradores === 'string' ? body.numeroMoradores : null;
  const recebeBeneficio = typeof body.recebeBeneficio === 'boolean' ? body.recebeBeneficio : false;
  const qualBeneficio = typeof body.qualBeneficio === 'string' ? body.qualBeneficio : null;
  const situacaoVulnerabilidade = typeof body.situacaoVulnerabilidade === 'string' ? body.situacaoVulnerabilidade : null;
  const possuiAlergias = typeof body.possuiAlergias === 'boolean' ? body.possuiAlergias : false;
  const quaisAlergias = typeof body.quaisAlergias === 'string' ? body.quaisAlergias : null;
  const usaMedicacao = typeof body.usaMedicacao === 'boolean' ? body.usaMedicacao : false;
  const quaisMedicacoes = typeof body.quaisMedicacoes === 'string' ? body.quaisMedicacoes : null;
  const possuiDeficiencia = typeof body.possuiDeficiencia === 'boolean' ? body.possuiDeficiencia : false;
  const qualDeficiencia = typeof body.qualDeficiencia === 'string' ? body.qualDeficiencia : null;
  const observacoesMedicas = typeof body.observacoesMedicas === 'string' ? body.observacoesMedicas : null;
  const contatoEmergenciaNome = typeof body.contatoEmergenciaNome === 'string' ? body.contatoEmergenciaNome : null;
  const contatoEmergenciaTelefone = typeof body.contatoEmergenciaTelefone === 'string' ? body.contatoEmergenciaTelefone : null;
  const dataEntradaONG = typeof body.dataEntradaONG === 'string' ? body.dataEntradaONG : null;
  const observacoesAdministrativas = typeof body.observacoesAdministrativas === 'string' ? body.observacoesAdministrativas : null;

  const id = makeId();
  const t = nowIso();

  try {
    await db.run(
      `INSERT INTO students (
        id, enrollment, name, nomeSocial, birth, guardian, relationship, phone, phone2, avatar, status,
        cep, street, number, complement, neighborhood, city, state,
        cpf, rg, guardianCpf, guardianRg,
        sexo, rede, turno, renda, turma,
        nacionalidade, orgaoEmissor, email, autorizadoBuscar,
        escolaAtual, serieAno, frequentandoRegularmente, jaRepetiuAno,
        numeroMoradores, recebeBeneficio, qualBeneficio, situacaoVulnerabilidade,
        possuiAlergias, quaisAlergias, usaMedicacao, quaisMedicacoes,
        possuiDeficiencia, qualDeficiencia, observacoesMedicas,
        contatoEmergenciaNome, contatoEmergenciaTelefone, dataEntradaONG, observacoesAdministrativas,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, enrollment, name, nomeSocial, birth, guardian, relationship, phone, phone2, avatar, status,
       cep, street, number, complement, neighborhood, city, state,
       cpf, rg, guardianCpf, guardianRg,
       sexo, rede, turno, renda, turma,
       nacionalidade, orgaoEmissor, email, autorizadoBuscar,
       escolaAtual, serieAno, frequentandoRegularmente, jaRepetiuAno,
       numeroMoradores, recebeBeneficio, qualBeneficio, situacaoVulnerabilidade,
       possuiAlergias, quaisAlergias, usaMedicacao, quaisMedicacoes,
       possuiDeficiencia, qualDeficiencia, observacoesMedicas,
       contatoEmergenciaNome, contatoEmergenciaTelefone, dataEntradaONG, observacoesAdministrativas,
       t, t]
    );
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return NextResponse.json({ error: 'enrollment already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'failed to create student' }, { status: 500 });
  }

  const student = await db.get(
    `SELECT id, enrollment, name, nomeSocial, birth, guardian, relationship, phone, phone2, avatar, status,
      cep, street, number, complement, neighborhood, city, state,
      cpf, rg, guardianCpf, guardianRg,
      sexo, rede, turno, renda, turma,
      nacionalidade, orgaoEmissor, email, autorizadoBuscar,
      escolaAtual, serieAno, frequentandoRegularmente, jaRepetiuAno,
      numeroMoradores, recebeBeneficio, qualBeneficio, situacaoVulnerabilidade,
      possuiAlergias, quaisAlergias, usaMedicacao, quaisMedicacoes,
      possuiDeficiencia, qualDeficiencia, observacoesMedicas,
      contatoEmergenciaNome, contatoEmergenciaTelefone, dataEntradaONG, observacoesAdministrativas,
      createdAt, updatedAt 
     FROM students WHERE id = ?`,
    [id]
  );
  return NextResponse.json({ student }, { status: 201 });
}
