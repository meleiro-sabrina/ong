import { NextResponse } from 'next/server';
import { getDb, nowIso } from '@/lib/server/sqlite';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
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
  if (!student) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ student });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = (await req.json().catch(() => null)) as null | {
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

  if (!patch) return NextResponse.json({ error: 'invalid json' }, { status: 400 });

  const db = await getDb();
  const existing = await db.get(
    `SELECT id, enrollment, name, birth, guardian, relationship, phone, phone2, avatar, status,
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
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const enrollment = patch.enrollment ?? existing.enrollment;
  const name = patch.name ?? existing.name;
  const birth = typeof patch.birth === 'string' ? patch.birth : existing.birth;
  const guardian = typeof patch.guardian === 'string' ? patch.guardian : existing.guardian;
  const relationship = typeof patch.relationship === 'string' ? patch.relationship : existing.relationship;
  const phone = typeof patch.phone === 'string' ? patch.phone : existing.phone;
  const phone2 = typeof patch.phone2 === 'string' ? patch.phone2 : existing.phone2;
  const avatar = typeof patch.avatar === 'string' ? patch.avatar : existing.avatar;
  const status = (patch.status as any) ?? existing.status;
  
  const cep = typeof patch.cep === 'string' ? patch.cep : existing.cep;
  const street = typeof patch.street === 'string' ? patch.street : existing.street;
  const number = typeof patch.number === 'string' ? patch.number : existing.number;
  const complement = typeof patch.complement === 'string' ? patch.complement : existing.complement;
  const neighborhood = typeof patch.neighborhood === 'string' ? patch.neighborhood : existing.neighborhood;
  const city = typeof patch.city === 'string' ? patch.city : existing.city;
  const state = typeof patch.state === 'string' ? patch.state : existing.state;
  
  const cpf = typeof patch.cpf === 'string' ? patch.cpf : existing.cpf;
  const rg = typeof patch.rg === 'string' ? patch.rg : existing.rg;
  const guardianCpf = typeof patch.guardianCpf === 'string' ? patch.guardianCpf : existing.guardianCpf;
  const guardianRg = typeof patch.guardianRg === 'string' ? patch.guardianRg : existing.guardianRg;
  
  const sexo = typeof patch.sexo === 'string' ? patch.sexo : existing.sexo;
  const rede = typeof patch.rede === 'string' ? patch.rede : existing.rede;
  const turno = typeof patch.turno === 'string' ? patch.turno : existing.turno;
  const renda = typeof patch.renda === 'string' ? patch.renda : existing.renda;
  const turma = typeof patch.turma === 'string' ? patch.turma : existing.turma;
  
  const nomeSocial = typeof patch.nomeSocial === 'string' ? patch.nomeSocial : existing.nomeSocial;
  const nacionalidade = typeof patch.nacionalidade === 'string' ? patch.nacionalidade : existing.nacionalidade;
  const orgaoEmissor = typeof patch.orgaoEmissor === 'string' ? patch.orgaoEmissor : existing.orgaoEmissor;
  const email = typeof patch.email === 'string' ? patch.email : existing.email;
  const autorizadoBuscar = typeof patch.autorizadoBuscar === 'boolean' ? patch.autorizadoBuscar : existing.autorizadoBuscar;
  const escolaAtual = typeof patch.escolaAtual === 'string' ? patch.escolaAtual : existing.escolaAtual;
  const serieAno = typeof patch.serieAno === 'string' ? patch.serieAno : existing.serieAno;
  const frequentandoRegularmente = typeof patch.frequentandoRegularmente === 'boolean' ? patch.frequentandoRegularmente : existing.frequentandoRegularmente;
  const jaRepetiuAno = typeof patch.jaRepetiuAno === 'boolean' ? patch.jaRepetiuAno : existing.jaRepetiuAno;
  const numeroMoradores = typeof patch.numeroMoradores === 'string' ? patch.numeroMoradores : existing.numeroMoradores;
  const recebeBeneficio = typeof patch.recebeBeneficio === 'boolean' ? patch.recebeBeneficio : existing.recebeBeneficio;
  const qualBeneficio = typeof patch.qualBeneficio === 'string' ? patch.qualBeneficio : existing.qualBeneficio;
  const situacaoVulnerabilidade = typeof patch.situacaoVulnerabilidade === 'string' ? patch.situacaoVulnerabilidade : existing.situacaoVulnerabilidade;
  const possuiAlergias = typeof patch.possuiAlergias === 'boolean' ? patch.possuiAlergias : existing.possuiAlergias;
  const quaisAlergias = typeof patch.quaisAlergias === 'string' ? patch.quaisAlergias : existing.quaisAlergias;
  const usaMedicacao = typeof patch.usaMedicacao === 'boolean' ? patch.usaMedicacao : existing.usaMedicacao;
  const quaisMedicacoes = typeof patch.quaisMedicacoes === 'string' ? patch.quaisMedicacoes : existing.quaisMedicacoes;
  const possuiDeficiencia = typeof patch.possuiDeficiencia === 'boolean' ? patch.possuiDeficiencia : existing.possuiDeficiencia;
  const qualDeficiencia = typeof patch.qualDeficiencia === 'string' ? patch.qualDeficiencia : existing.qualDeficiencia;
  const observacoesMedicas = typeof patch.observacoesMedicas === 'string' ? patch.observacoesMedicas : existing.observacoesMedicas;
  const contatoEmergenciaNome = typeof patch.contatoEmergenciaNome === 'string' ? patch.contatoEmergenciaNome : existing.contatoEmergenciaNome;
  const contatoEmergenciaTelefone = typeof patch.contatoEmergenciaTelefone === 'string' ? patch.contatoEmergenciaTelefone : existing.contatoEmergenciaTelefone;
  const dataEntradaONG = typeof patch.dataEntradaONG === 'string' ? patch.dataEntradaONG : existing.dataEntradaONG;
  const observacoesAdministrativas = typeof patch.observacoesAdministrativas === 'string' ? patch.observacoesAdministrativas : existing.observacoesAdministrativas;
  
  const updatedAt = nowIso();

  try {
    await db.run(
      `UPDATE students SET 
        enrollment = ?, name = ?, nomeSocial = ?, birth = ?, guardian = ?, relationship = ?, phone = ?, phone2 = ?, avatar = ?, status = ?,
        cep = ?, street = ?, number = ?, complement = ?, neighborhood = ?, city = ?, state = ?,
        cpf = ?, rg = ?, guardianCpf = ?, guardianRg = ?,
        sexo = ?, rede = ?, turno = ?, renda = ?, turma = ?,
        nacionalidade = ?, orgaoEmissor = ?, email = ?, autorizadoBuscar = ?,
        escolaAtual = ?, serieAno = ?, frequentandoRegularmente = ?, jaRepetiuAno = ?,
        numeroMoradores = ?, recebeBeneficio = ?, qualBeneficio = ?, situacaoVulnerabilidade = ?,
        possuiAlergias = ?, quaisAlergias = ?, usaMedicacao = ?, quaisMedicacoes = ?,
        possuiDeficiencia = ?, qualDeficiencia = ?, observacoesMedicas = ?,
        contatoEmergenciaNome = ?, contatoEmergenciaTelefone = ?, dataEntradaONG = ?, observacoesAdministrativas = ?,
        updatedAt = ? 
       WHERE id = ?`,
      [enrollment, name, nomeSocial, birth, guardian, relationship, phone, phone2, avatar, status,
       cep, street, number, complement, neighborhood, city, state,
       cpf, rg, guardianCpf, guardianRg,
       sexo, rede, turno, renda, turma,
       nacionalidade, orgaoEmissor, email, autorizadoBuscar,
       escolaAtual, serieAno, frequentandoRegularmente, jaRepetiuAno,
       numeroMoradores, recebeBeneficio, qualBeneficio, situacaoVulnerabilidade,
       possuiAlergias, quaisAlergias, usaMedicacao, quaisMedicacoes,
       possuiDeficiencia, qualDeficiencia, observacoesMedicas,
       contatoEmergenciaNome, contatoEmergenciaTelefone, dataEntradaONG, observacoesAdministrativas,
       updatedAt, id]
    );
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return NextResponse.json({ error: 'enrollment already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'failed to update student' }, { status: 500 });
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
  return NextResponse.json({ student });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const db = await getDb();
  const result = await db.run('DELETE FROM students WHERE id = ?', [id]);
  if (!result.changes) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
