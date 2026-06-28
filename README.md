# Diaita Mobile

Diaita Mobile e um aplicativo para acompanhamento de treinos, dieta, alimentacao e evolucao fisica. A ideia central e reunir em um unico lugar a planilha de treino, o diario alimentar, os dashboards de progresso e uma biblioteca visual de exercicios com GIFs ou modelos 3D.

## Objetivo do app

O Diaita deve ajudar o usuario a treinar melhor, comer com mais controle e entender sua evolucao ao longo do tempo. O app nao deve ser apenas um bloco de notas fitness, mas um painel inteligente de consistencia, carga, volume, calorias, macros e progresso corporal.

## Funcionalidades principais

### Treinos

- Biblioteca de exercicios com GIFs ou visualizacao 3D da execucao.
- Filtro por grupo muscular, equipamento, nivel, objetivo e local de treino.
- Planilhas de treino no modelo A/B/C, push/pull/legs, superior/inferior ou personalizadas.
- Registro de series, repeticoes, carga, descanso e observacoes.
- Historico por exercicio.
- Timer de descanso entre series.
- Registro de treino concluido.
- Substituicao de exercicios por equipamento, lesao ou preferencia.
- Treinos para academia, casa ou peso corporal.
- Controle de recordes pessoais: maior carga, maior volume e maior numero de repeticoes.
- Campo de RPE ou percepcao de esforco.
- Sugestao de progressao de carga com base no historico.
- Alertas de grupos musculares muito treinados ou pouco treinados.

### Dashboard de evolucao

- Evolucao de carga por exercicio.
- Evolucao de volume semanal por grupo muscular.
- Grafico de peso corporal.
- Registro de medidas corporais: cintura, peito, braco, perna, quadril e outros.
- Fotos de evolucao.
- Frequencia semanal de treinos.
- Aderencia a dieta.
- Calorias consumidas versus meta diaria.
- Proteina, carboidrato e gordura consumidos versus metas.
- Comparativo entre semana atual, semana anterior e mes anterior.
- Insights automaticos, como estagnacao de carga ou baixa aderencia alimentar.

### Dieta e alimentacao

- Diario alimentar por refeicao.
- Cadastro de alimentos com calorias e macronutrientes.
- Controle de calorias, proteinas, carboidratos e gorduras.
- Meta diaria de calorias.
- Divisao por cafe da manha, almoco, lanche, jantar e ceia.
- Cadastro de receitas.
- Calculo de calorias por porcao.
- Refeicoes favoritas e frequentes.
- Sugestao de substituicoes alimentares.
- Planejamento alimentar semanal.
- Lista de compras baseada na dieta.
- Controle de agua.
- Controle de suplementos.
- Futuro scanner de codigo de barras para alimentos industrializados.

### Personalizacao

- Perfil com idade, peso, altura, sexo, nivel de atividade e objetivo.
- Objetivos como emagrecimento, ganho de massa, manutencao ou performance.
- Definicao de dias disponiveis para treino.
- Tempo medio por treino.
- Equipamentos disponiveis.
- Restricoes alimentares.
- Preferencias alimentares.
- Lesoes ou exercicios evitados.

### Modo treino

- Tela focada no exercicio atual.
- Series planejadas e realizadas.
- Carga anterior como referencia.
- Timer de descanso.
- Botao rapido para concluir serie.
- Campo para anotacoes durante o treino.
- Sugestao da proxima carga.
- Funcionamento offline para registrar treino sem internet.

### Inteligencia e automacao

- Geracao de treinos baseada em objetivo, nivel e equipamentos.
- Ajuste automatico da planilha conforme desempenho.
- Sugestao de metas caloricas e macros.
- Analise da evolucao de carga, volume e peso.
- Identificacao de estagnacao.
- Sugestoes de substituicao de exercicios e alimentos.
- Relatorios semanais de desempenho.

### Gamificacao

- Sequencia de dias treinando.
- Metas semanais.
- Pontuacao de consistencia.
- Conquistas por progresso, aderencia e recordes pessoais.
- Badges por completar treinos, bater PRs ou cumprir metas de dieta.

### Recursos para profissionais

- Exportacao de relatorios para personal trainer ou nutricionista.
- Perfil de aluno e perfil de profissional.
- Treinador criando planilhas para alunos.
- Nutricionista criando planos alimentares.
- Comentarios e acompanhamento remoto.
- Chat com profissional em uma versao futura.

## Estrutura sugerida do app

As principais abas do Diaita podem ser:

- Hoje: resumo do treino, dieta, agua, calorias e tarefas do dia.
- Treino: planilhas, exercicios, modo treino e historico.
- Dieta: refeicoes, alimentos, macros, calorias e receitas.
- Progresso: graficos, medidas, fotos e insights.
- Perfil: objetivos, preferencias, configuracoes e assinatura.

## MVP recomendado

Para a primeira versao, o foco deve ser em funcionalidades essenciais:

1. Cadastro e login.
2. Perfil do usuario com objetivo, peso, altura e meta calorica.
3. Biblioteca inicial de exercicios com GIFs ou imagens.
4. Criacao e visualizacao de planilhas de treino.
5. Registro de treino realizado.
6. Dashboard simples de carga, volume e frequencia.
7. Diario alimentar com calorias e macros.
8. Registro de peso corporal.

## Stack recomendada

- Mobile: React Native com Expo.
- Backend: Supabase.
- Banco de dados: PostgreSQL.
- Autenticacao: Supabase Auth.
- Storage: Supabase Storage para GIFs, imagens e fotos de evolucao.
- Graficos: Victory Native ou React Native Chart Kit.
- UI: NativeWind ou React Native Paper.
- Pagamentos futuros: RevenueCat.
- IA futura: OpenAI API.

## Possiveis recursos premium

- Planilhas ilimitadas.
- Dietas ilimitadas.
- Relatorios avancados.
- IA para gerar treinos e dieta.
- Backup de fotos de evolucao.
- Exportacao em PDF.
- Scanner de codigo de barras.
- Integracao com smartwatch.
- Acompanhamento por personal trainer ou nutricionista.
