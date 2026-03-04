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

const firstNames = [
  'Ana', 'Carlos', 'Maria', 'João', 'Pedro', 'Luíza', 'Gabriel', 'Juliana', 'Marcos', 'Fernanda',
  'Roberto', 'Beatriz', 'Lucas', 'Camila', 'Rafael', 'Isabela', 'Gustavo', 'Larissa', 'Diego', 'Sofia',
  'Thiago', 'Letícia', 'Bruno', 'Amanda', 'Felipe', 'Tatiana', 'Eduardo', 'Renata', 'Vinícius', 'Patrícia',
  'Leonardo', 'Mariana', 'Ricardo', 'Vitória', 'André', 'Carla', 'Samuel', 'Natália', 'Alexandre', 'Cláudia',
  'Fábio', 'Daniela', 'Igor', 'Paula', 'Nícolas', 'Eliane', 'Rogério', 'Cristina', 'Wagner', 'Mônica',
  'Sérgio', 'Vanessa', 'Caio', 'Luana', 'Otávio', 'Priscila', 'Leandro', 'Aline', 'Rodrigo', 'Kelly',
  'Thales', 'Bárbara', 'César', 'Renato', 'Simone', 'Heitor', 'Rosa', 'Mauro', 'Elaine', 'Cláudio',
  'Regina', 'Nelson', 'Iara', 'Sandro', 'Miriam', 'Flávio', 'Ester', 'Mário', 'Lígia', 'Davi',
  'Laura', 'Breno', 'Cecília', 'Hugo', 'Selma', 'Paulo', 'Denise', 'Edson', 'Lúcia', 'Fábio',
  'Teresa', 'Raul', 'Cátia', 'Benício', 'Silvana', 'Geraldo', 'Edna', 'Evandro', 'Sueli', 'Valdir'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Ferreira', 'Almeida', 'Ribeiro', 'Gomes',
  'Martins', 'Carvalho', 'Alves', 'Pereira', 'Barbosa', 'Gonçalves', 'Dias', 'Rodrigues', 'Cruz', 'Nogueira',
  'Castro', 'Azevedo', 'Mendes', 'Fernandes', 'Barros', 'Pinto', 'Correia', 'Campos', 'Cardoso', 'Ramos',
  'Lopes', 'Moura', 'Monteiro', 'Cunha', 'Araújo', 'Borges', 'Peixoto', 'Rocha', 'Machado', 'Freitas',
  'Nascimento', 'Lacerda', 'Cavalcanti', 'Magalhães', 'Tavares', 'Viana', 'Braga', 'Mota', 'Teixeira', 'Aguiar',
  'Trindade', 'Siqueira', 'Farias', 'Queiroz', 'Pimentel', 'Valente', 'Domingues', 'Guimarães', 'Espíndola', 'Cortez',
  'Amaral', 'Salgado', 'Galvão', 'Quintela', 'Coutinho', 'Bittencourt', 'Albuquerque', 'Villalba', 'Nogueira', 'Cavalcanti'
];

const streets = [
  'Rua das Flores', 'Avenida Central', 'Travessa Verde', 'Alameda das Árvores', 'Praça da Sé',
  'Rua do Comércio', 'Avenida Paulista', 'Rua Augusta', 'Alameda Santos', 'Rua XV de Novembro',
  'Rua da Consolação', 'Avenida Brigadeiro', 'Rua Haddock Lobo', 'Alameda Jaú', 'Rua Oscar Freire',
  'Rua da Mooca', 'Avenida do Estado', 'Rua da Mooca', 'Alameda Barão', 'Rua da Palma',
  'Rua dos Pinheiros', 'Avenida Faria Lima', 'Rua Teodoro Sampaio', 'Alameda Itu', 'Rua Cardeal Arcoverde',
  'Rua da Abolição', 'Avenida Ipiranga', 'Rua da Consolação', 'Alameda Santos', 'Rua da Glória',
  'Rua do Paraíso', 'Avenida Brasil', 'Rua da Bela Vista', 'Alameda Glete', 'Rua da Boa Vista',
  'Rua da Mooca', 'Avenida do Café', 'Rua da Cantareira', 'Alameda dos Anjos', 'Rua dos Andradas',
  'Rua do Pari', 'Avenida Rudge', 'Rua do Taquari', 'Alameda dos Maracatins', 'Rua dos Timbiras'
];

const neighborhoods = [
  'Centro', 'Bela Vista', 'Bom Retiro', 'Cambuci', 'Consolação', 'Higienópolis', 'Pari', 'Bela Vista',
  'Liberdade', 'Sé', 'Santa Cecília', 'Vila Buarque', 'Jardim Paulista', 'Paraíso', 'Bela Vista',
  'Mooca', 'Água Rasa', 'Tatuapé', 'Pari', 'Brás', 'Mooca', 'Bela Vista', 'Pari',
  'Pinheiros', 'Jardim Paulista', 'Vila Madalena', 'Consolação', 'Higienópolis', 'Cerqueira César',
  'Perdizes', 'Sumaré', 'Vila Clementino', 'Pinheiros', 'Alto de Pinheiros', 'Jardim Paulista',
  'Itaim Bibi', 'Vila Olímpia', 'Moema', 'Brooklin', 'Vila Cordeiro', 'Indianópolis',
  'Santo Amaro', 'Campo Belo', 'Socorro', 'Jabaquara', 'Mirandópolis', 'Santo Amaro'
];

const cities = ['São Paulo', 'Campinas', 'Santo André', 'Osasco', 'Guarulhos', 'São Bernardo do Campo', 'São Caetano do Sul', 'Diadema', 'Mauá', 'Ribeirão Preto'];
const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF'];

const schools = [
  'Escola Municipal A', 'Colégio Estadual B', 'Escola Particular C', 'Instituto de Educação D',
  'Escola Estadual E', 'Colégio Particular F', 'Escola Municipal G', 'Instituto de Ensino H',
  'Escola Particular I', 'Colégio Estadual J', 'Escola Municipal K', 'Instituto D',
  'Escola Estadual M', 'Colégio Particular N', 'Escola Municipal O', 'Instituto P',
  'Escola Particular Q', 'Colégio Estadual R', 'Escola Municipal S', 'Instituto U',
  'Escola Estadual V', 'Colégio Particular X', 'Escola Municipal Y', 'Instituto Z'
];

const series = ['1º Ano EF', '2º Ano EF', '3º Ano EF', '4º Ano EF', '5º Ano EF', '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF', '1º Ano EM', '2º Ano EM', '3º Ano EM'];

const benefits = [
  'Bolsa Família', 'Auxílio Brasil', 'Bolsa Escola', 'Auxílio Gás', 'Programa Minha Casa Minha Vida',
  'Benefício de Prestação Continuada', 'Auxílio Doença', 'Salário Família', 'Pensão por Morte', 'Aposentadoria'
];

const campaigns = [
  'Reforma da Biblioteca', 'Campanha de Natal', 'Projeto Escolar 2024', 'Dia das Crianças',
  'Inverno Solidário', 'Voluntariado Jovem', 'Capacitação Profissional', 'Apoio Pedagógico',
  'Alimentação Escolar', 'Transporte Escolar', 'Material Didático', 'Cultura e Arte',
  'Esporte e Lazer', 'Saúde e Bem-Estar', 'Tecnologia na Educação', 'Meio Ambiente'
];

const classCodes = Array.from({ length: 500 }, (_, i) => `TUR-${2024 + Math.floor(i / 100)}-${String(i + 1).padStart(4, '0')}`);

const classNames = [
  'Informática Básica', 'Reforço Escolar - Matemática', 'Inglês Intermediário', 'Artes Plásticas',
  'Robótica Educacional', 'Programação para Jovens', 'Música e Canto', 'Teatro e Expressão Corporal',
  'Xadrez e Raciocínio', 'Ciências Experimentais', 'História e Cultura Brasileira', 'Geografia e Meio Ambiente',
  'Educação Financeira', 'Empreendedorismo Juvenil', 'Cidadania e Direitos Humanos', 'Comunicação e Oratória',
  'Desenho e Pintura', 'Dança Contemporânea', 'Jornalismo Escolar', 'Fotografia Digital',
  'Culinária Básica', 'Primeiros Socorros', 'Segurança na Internet', 'Saúde Mental'
];

const schedules = [
  'Seg, Qua - 14:00 às 16:00', 'Ter, Qui - 09:00 às 11:00', 'Sex - 14:00 às 17:00',
  'Sáb - 09:00 às 12:00', 'Seg, Qua, Sex - 08:00 às 10:00', 'Ter, Qui - 15:00 às 17:00',
  'Seg a Sex - 13:00 às 15:00', 'Sáb, Dom - 10:00 às 12:00', 'Seg, Qua - 16:00 às 18:00',
  'Ter, Qui, Sex - 07:30 às 09:30', 'Seg, Qua - 10:00 às 12:00', 'Ter, Qui - 14:00 às 16:00',
  'Sex - 18:00 às 20:00', 'Sáb - 14:00 às 17:00', 'Dom - 09:00 às 11:00',
  'Seg, Qua, Sex - 17:00 às 19:00', 'Ter, Qui - 08:00 às 10:00', 'Seg a Sex - 16:00 às 18:00'
];

const professorNames = Array.from({ length: 100 }, (_, i) => `${randChoice(firstNames)} ${randChoice(lastNames)}`);

const stockCategories = [
  'Material Escolar', 'Material de Limpeza', 'Material de Escritório', 'Material de Higiene',
  'Material Esportivo', 'Material Cultural', 'Material Tecnológico', 'Material de Primeiros Socorros',
  'Material de Cozinha', 'Material de Manutenção', 'Material de Jardim', 'Material de Eventos'
];

const stockItems = [
  'Caderno Universitário', 'Lápis Preto', 'Borracha Branca', 'Caneta Azul', 'Régua 30cm',
  'Papel A4', 'Clips de Papel', 'Grampeador', 'Tesoura Escolar', 'Cola Bastão',
  'Detergente Líquido', 'Água Sanitária', 'Pano de Chão', 'Vassoura', 'Lixeira Plástica',
  'Pasta Suspensa', 'Clips de Metal', 'Papel Timbrado', 'Envelope Ofício', 'Carimbo',
  'Sabonete Líquido', 'Papel Higiênico', 'Álcool em Gel', 'Luvas Descartáveis', 'Máscara',
  'Bola de Futebol', 'Rede de Vôlei', 'Raquete de Tênis', 'Tênis de Corrida', 'Chuteira',
  'Livro Didático', 'Dicionário', 'Atlas Geográfico', 'Globo Terrestre', 'Mapa Mundi',
  'Notebook', 'Mouse Óptico', 'Teclado USB', 'Fone de Ouvido', 'Pen Drive',
  'Curativo Adesivo', 'Gaze Esterilizada', 'Esparadrapo', 'Antisséptico', 'Termômetro',
  'Panela de Alumínio', 'Faca de Cozinha', 'Tábua de Corte', 'Prato Fundo', 'Concha',
  'Chave de Fenda', 'Chave Phillips', 'Alicate Universal', 'Furadeira', 'Parafuso',
  'Mangueira Jardim', 'Pá de Jardim', 'Tesoura de Poda', 'Adubo Orgânico', 'Vaso de Cerâmica',
  'Banner Promocional', 'Corda de Nylon', 'Placa de Identificação', 'Microfone', 'Caixa de Som'
];

const volunteerRoles = [
  'Eventos', 'Administrativo', 'Manutenção', 'Pedagógico', 'Cultural', 'Esportivo',
  'Comunicação', 'Financeiro', 'Secretaria', 'Transporte', 'Alimentação', 'Limpeza'
];

const donorTypes = ['Empresa', 'Pessoa Física', 'Instituição', 'Governo', 'ONG Parceira'];
const donationMethods = ['Transferência Bancária', 'PIX', 'Boleto', 'Cartão de Crédito', 'Dinheiro', 'Cheque'];
const donationTypes = ['Recorrente', 'Única', 'Pontual', 'Campanha Específica'];

async function ensureDir(dir: string) {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch {
    // ignore
  }
}

function dbPath() {
  return path.join(process.cwd(), '.data', 'app.db');
}

async function seed500(): Promise<void> {
  const dir = path.dirname(dbPath());
  await ensureDir(dir);
  const db = await open({ filename: dbPath(), driver: sqlite3.Database });

  const t = nowIso();

  // === 500 ALUNOS ===
  const students = Array.from({ length: 500 }, (_, i) => {
    const firstName = randChoice(firstNames);
    const lastName = randChoice(lastNames);
    const birthYear = 2000 + randInt(5, 18);
    const birthMonth = String(randInt(1, 12)).padStart(2, '0');
    const birthDay = String(randInt(1, 28)).padStart(2, '0');
    const birth = `${birthYear}-${birthMonth}-${birthDay}`;
    const guardian = `${randChoice(firstNames)} ${randChoice(lastNames)}`;
    const phone = `(${randInt(10, 99)}) ${randInt(9000, 9999)}-${randInt(1000, 9999)}`;
    const phone2 = Math.random() > 0.7 ? `(${randInt(10, 99)}) ${randInt(9000, 9999)}-${randInt(1000, 9999)}` : null;
    const cep = `${randInt(10000, 99999)}-${randInt(100, 999)}`;
    const street = randChoice(streets);
    const number = String(randInt(1, 9999));
    const complement = Math.random() > 0.8 ? randChoice(['Apto 101', 'Casa 2', 'Sala 3', 'Bloco B']) : null;
    const neighborhood = randChoice(neighborhoods);
    const city = randChoice(cities);
    const state = randChoice(states);
    const cpf = `${randInt(100, 999)}.${randInt(100, 999)}.${randInt(100, 999)}-${randInt(10, 99)}`;
    const rg = `${randInt(10000000, 99999999)}-${randChoice(['SP', 'RJ', 'MG'])}`;
    const guardianCpf = `${randInt(100, 999)}.${randInt(100, 999)}.${randInt(100, 999)}-${randInt(10, 99)}`;
    const guardianRg = `${randInt(10000000, 99999999)}-${randChoice(['SP', 'RJ', 'MG'])}`;
    const sexo = randChoice(['Masculino', 'Feminino']);
    const rede = randChoice(['Pública', 'Privada', 'Municipal', 'Estadual']);
    const turno = randChoice(['Manhã', 'Tarde', 'Noite', 'Integral']);
    const renda = randChoice(['Até 1 SM', '1 a 2 SM', '2 a 3 SM', '3 a 5 SM', 'Mais de 5 SM']);
    const turma = `Turma ${randInt(1, 20)}`;
    const nacionalidade = 'Brasileira';
    const orgaoEmissor = randChoice(['SSP', 'Detran', 'Receita Federal', 'Justiça Federal']);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    const autorizadoBuscar = Math.random() > 0.3;
    const escolaAtual = randChoice(schools);
    const serieAno = randChoice(series);
    const frequentandoRegularmente = Math.random() > 0.2;
    const jaRepetiuAno = Math.random() > 0.7;
    const numeroMoradores = String(randInt(1, 10));
    const recebeBeneficio = Math.random() > 0.4;
    const qualBeneficio = recebeBeneficio ? randChoice(benefits) : null;
    const situacaoVulnerabilidade = randChoice(['Nenhuma', 'Baixa Renda', 'Deficiência', 'Violência Doméstica', 'Abandono']);
    const possuiAlergias = Math.random() > 0.8;
    const quaisAlergias = possuiAlergias ? randChoice(['Amendoim', 'Frutos do Mar', 'Látex', 'Poeira', 'Pólen']) : null;
    const usaMedicacao = Math.random() > 0.85;
    const quaisMedicacoes = usaMedicacao ? randChoice(['Ritalina', 'Insulina', 'Antialérgico', 'Vitamina D', 'Anti-hipertensivo']) : null;
    const possuiDeficiencia = Math.random() > 0.9;
    const qualDeficiencia = possuiDeficiencia ? randChoice(['Visual', 'Auditiva', 'Física', 'Intelectual', 'Múltipla']) : null;
    const observacoesMedicas = Math.random() > 0.7 ? randChoice(['Alergia severa', 'Uso contínuo de medicamento', 'Restrição alimentar', 'Necessita acompanhamento']) : null;
    const contatoEmergenciaNome = `${randChoice(firstNames)} ${randChoice(lastNames)}`;
    const contatoEmergenciaTelefone = `(${randInt(10, 99)}) ${randInt(9000, 9999)}-${randInt(1000, 9999)}`;
    const dataEntradaONG = randDate(new Date('2020-01-01'), new Date('2024-12-31'));
    const observacoesAdministrativas = Math.random() > 0.6 ? randChoice(['Bom desempenho', 'Necessita apoio', 'Participa ativamente', 'Histórico de faltas']) : null;
    const status = randChoice(['active', 'inactive', 'dropout']);

    return {
      id: makeId(),
      enrollment: `MAT-${2024}-${String(i + 1).padStart(4, '0')}`,
      name: `${firstName} ${lastName}`,
      birth,
      guardian,
      relationship: randChoice(['Mãe', 'Pai', 'Tia', 'Tio', 'Avó', 'Avô', 'Responsável']),
      phone,
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
      sexo,
      rede,
      turno,
      renda,
      turma,
      nacionalidade,
      orgaoEmissor,
      email,
      autorizadoBuscar,
      escolaAtual,
      serieAno,
      frequentandoRegularmente,
      jaRepetiuAno,
      numeroMoradores,
      recebeBeneficio,
      qualBeneficio,
      situacaoVulnerabilidade,
      possuiAlergias,
      quaisAlergias,
      usaMedicacao,
      quaisMedicacoes,
      possuiDeficiencia,
      qualDeficiencia,
      observacoesMedicas,
      contatoEmergenciaNome,
      contatoEmergenciaTelefone,
      dataEntradaONG,
      observacoesAdministrativas,
      status,
      createdAt: t,
      updatedAt: t,
    };
  });

  // === 500 PROFESSORES ===
  const professors = Array.from({ length: 500 }, (_, i) => {
    const firstName = randChoice(firstNames);
    const lastName = randChoice(lastNames);
    const birthYear = 1950 + randInt(25, 65);
    const birthMonth = String(randInt(1, 12)).padStart(2, '0');
    const birthDay = String(randInt(1, 28)).padStart(2, '0');
    const birth = `${birthYear}-${birthMonth}-${birthDay}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@escola.edu.br`;
    const phone = `(${randInt(10, 99)}) ${randInt(2000, 9999)}-${randInt(1000, 9999)}`;
    const cpf = `${randInt(100, 999)}.${randInt(100, 999)}.${randInt(100, 999)}-${randInt(10, 99)}`;
    const specialization = randChoice([
      'Matemática e Exatas', 'Português e Literatura', 'História e Geografia', 'Ciências e Biologia',
      'Informática e Tecnologia', 'Artes e Cultura', 'Educação Física', 'Inglês e Espanhol',
      'Filosofia e Sociologia', 'Química e Física', 'Música e Artes Cênicas', 'Orientação Educacional'
    ]);
    const type = randChoice(['Voluntário', 'Horista', 'CLT', 'PJ']);
    const hourlyRate = type === 'Horista' ? randFloat(30, 150) : null;
    const monthlySalary = type === 'CLT' || type === 'PJ' ? randFloat(2000, 8000) : null;
    const status = randChoice(['active', 'inactive']);

    return {
      id: makeId(),
      name: `${firstName} ${lastName}`,
      email,
      phone,
      cpf,
      birth,
      specialization,
      type,
      hourlyRate,
      monthlySalary,
      avatar: null,
      status,
      createdAt: t,
      updatedAt: t,
    };
  });

  // === 500 VOLUNTÁRIOS ===
  const volunteers = Array.from({ length: 500 }, (_, i) => {
    const firstName = randChoice(firstNames);
    const lastName = randChoice(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@voluntario.org`;
    const phone = `(${randInt(10, 99)}) ${randInt(2000, 9999)}-${randInt(1000, 9999)}`;
    const role = randChoice(volunteerRoles);
    const hours = randInt(0, 500);
    const status = randChoice(['active', 'inactive']);

    return {
      id: makeId(),
      name: `${firstName} ${lastName}`,
      email,
      phone,
      role,
      hours,
      avatar: null,
      status,
      createdAt: t,
      updatedAt: t,
    };
  });

  // === 500 TURMAS ===
  const classes = Array.from({ length: 500 }, (_, i) => {
    const startDate = randDate(new Date('2024-01-01'), new Date('2024-06-30'));
    const endDate = Math.random() > 0.3 ? randDate(new Date('2024-07-01'), new Date('2024-12-31')) : null;
    const costPerClass = Math.random() > 0.5 ? randFloat(20, 100) : null;
    const professorPaymentType = costPerClass ? randChoice(['Por aula', 'Mensal', 'Por projeto']) : null;
    const status = randChoice(['active', 'suspended', 'ended']);
    const currentStudents = randInt(0, 25);
    const maxStudents = randInt(15, 30);

    return {
      id: makeId(),
      code: classCodes[i],
      name: classNames[i % classNames.length],
      professor: professorNames[i % professorNames.length],
      professor_substituto: Math.random() > 0.8 ? professorNames[(i + 50) % professorNames.length] : null,
      schedule: schedules[i % schedules.length],
      startDate,
      endDate,
      costPerClass,
      professorPaymentType,
      status,
      currentStudents,
      maxStudents,
      createdAt: t,
      updatedAt: t,
    };
  });

  // === 500 DOAÇÕES ===
  const donations = Array.from({ length: 500 }, (_, i) => {
    const donor = `${randChoice(donorTypes)} ${randChoice(lastNames)}`;
    const amount = randFloat(10, 5000);
    const date = randDate(new Date('2024-01-01'), new Date('2024-12-31'));
    const type = randChoice(donationTypes);
    const method = randChoice(donationMethods);
    const status = randChoice(['completed', 'pending']);
    const campaign = randChoice(campaigns);
    const notes = Math.random() > 0.6 ? randChoice(['Doação espontânea', 'Campanha especial', 'Agradecimento', 'Incentivo fiscal']) : null;

    return {
      id: makeId(),
      donor,
      amount,
      date,
      type,
      method,
      status,
      campaign,
      notes,
      createdAt: t,
      updatedAt: t,
    };
  });

  // === 500 ESTOQUE ===
  const stockItems500 = Array.from({ length: 500 }, (_, i) => {
    const category = stockCategories[i % stockCategories.length];
    const name = stockItems[i % stockItems.length];
    const quantity = randInt(1, 100);
    const unit = randChoice(['unidade', 'caixa', 'pacote', 'kg', 'litro', 'metro']);
    const minQuantity = randInt(1, 10);
    const notes = Math.random() > 0.5 ? randChoice(['Estoque baixo', 'Repor em breve', 'Verificar validade', 'Armazenar em local seco']) : null;

    return {
      id: makeId(),
      name,
      category,
      quantity,
      unit,
      minQuantity,
      notes,
      createdAt: t,
      updatedAt: t,
    };
  });

  // === INSERT ALL ===
  console.log('Inserindo 500 alunos...');
  for (const student of students) {
    await db.run(
      `INSERT INTO students (
        id, enrollment, name, birth, guardian, relationship, phone, phone2, status,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student.id, student.enrollment, student.name, student.birth, student.guardian, student.relationship,
        student.phone, student.phone2, student.status,
        student.cep, student.street, student.number, student.complement, student.neighborhood,
        student.city, student.state, student.cpf, student.rg, student.guardianCpf, student.guardianRg,
        student.sexo, student.rede, student.turno, student.renda, student.turma,
        student.nacionalidade, student.orgaoEmissor, student.email, student.autorizadoBuscar,
        student.escolaAtual, student.serieAno, student.frequentandoRegularmente, student.jaRepetiuAno,
        student.numeroMoradores, student.recebeBeneficio, student.qualBeneficio, student.situacaoVulnerabilidade,
        student.possuiAlergias, student.quaisAlergias, student.usaMedicacao, student.quaisMedicacoes,
        student.possuiDeficiencia, student.qualDeficiencia, student.observacoesMedicas,
        student.contatoEmergenciaNome, student.contatoEmergenciaTelefone, student.dataEntradaONG,
        student.observacoesAdministrativas, student.createdAt, student.updatedAt
      ]
    );
  }

  console.log('Inserindo 500 professores...');
  for (const prof of professors) {
    await db.run(
      `INSERT INTO professors (
        id, name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [prof.id, prof.name, prof.email, prof.phone, prof.cpf, prof.birth, prof.specialization,
       prof.type, prof.hourlyRate, prof.monthlySalary, prof.avatar, prof.status, prof.createdAt, prof.updatedAt]
    );
  }

  console.log('Inserindo 500 voluntários...');
  for (const vol of volunteers) {
    await db.run(
      `INSERT INTO volunteers (
        id, name, email, phone, role, hours, avatar, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vol.id, vol.name, vol.email, vol.phone, vol.role, vol.hours, vol.avatar, vol.status, vol.createdAt, vol.updatedAt]
    );
  }

  console.log('Inserindo 500 turmas...');
  for (const cls of classes) {
    await db.run(
      `INSERT INTO classes (
        id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cls.id, cls.code, cls.name, cls.professor, cls.professor_substituto, cls.schedule,
       cls.startDate, cls.endDate, cls.costPerClass, cls.professorPaymentType, cls.status,
       cls.currentStudents, cls.maxStudents, cls.createdAt, cls.updatedAt]
    );
  }

  console.log('Inserindo 500 doações...');
  for (const donation of donations) {
    await db.run(
      `INSERT INTO donations (
        id, donor, amount, date, type, method, status, campaign, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [donation.id, donation.donor, donation.amount, donation.date, donation.type, donation.method,
       donation.status, donation.campaign, donation.notes, donation.createdAt, donation.updatedAt]
    );
  }

  console.log('Inserindo 500 itens de estoque...');
  for (const item of stockItems500) {
    await db.run(
      `INSERT INTO stock_items (
        id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.name, item.category, item.quantity, item.unit, item.minQuantity, item.notes, item.createdAt, item.updatedAt]
    );
  }

  console.log('Seed concluído: 500 registros em cada módulo principal.');
  await db.close();
}

seed500().catch(console.error);
