# Diaita Mobile - Passo a passo de implementacao

Este documento descreve um caminho pratico para implementar o Diaita Mobile de forma incremental, com foco primeiro em um MVP funcional e depois em recursos avancados.

## 1. Criar o projeto mobile

Use React Native com Expo para acelerar o desenvolvimento multiplataforma.

```bash
npx create-expo-app diaita-mobile
cd diaita-mobile
npx expo start
```

Dependencias iniciais recomendadas:

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens
npm install @supabase/supabase-js
npm install nativewind
npm install react-native-chart-kit
```

## 2. Definir a navegacao

Crie uma navegacao por abas com as telas principais:

- Hoje
- Treino
- Dieta
- Progresso
- Perfil

Estrutura sugerida com Expo Router:

```text
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    treino.tsx
    dieta.tsx
    progresso.tsx
    perfil.tsx
```

## 3. Criar o projeto no Supabase

No Supabase:

1. Crie um novo projeto.
2. Ative autenticacao por email e senha.
3. Copie a URL do projeto e a anon key.
4. Crie o arquivo de variaveis de ambiente no app.

Exemplo:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## 4. Modelar o banco de dados

Tabelas iniciais recomendadas:

```text
profiles
exercises
workout_plans
workout_plan_days
workout_plan_exercises
workout_logs
workout_log_sets
foods
meals
meal_items
body_metrics
progress_photos
```

### profiles

Guarda os dados principais do usuario:

- id
- user_id
- name
- birth_date
- height_cm
- weight_kg
- goal
- activity_level
- daily_calorie_goal
- daily_protein_goal
- daily_carbs_goal
- daily_fat_goal

### exercises

Biblioteca de exercicios:

- id
- name
- muscle_group
- equipment
- difficulty
- instructions
- media_url
- media_type

### workout_plans

Planilhas de treino:

- id
- user_id
- name
- goal
- days_per_week
- active

### workout_logs

Treinos realizados:

- id
- user_id
- workout_plan_id
- started_at
- finished_at
- estimated_calories_burned
- perceived_effort
- notes

### foods

Base de alimentos:

- id
- name
- calories_per_100g
- protein_per_100g
- carbs_per_100g
- fat_per_100g
- barcode

### meals

Refeicoes registradas:

- id
- user_id
- meal_type
- eaten_at
- notes

### body_metrics

Evolucao corporal:

- id
- user_id
- measured_at
- weight_kg
- waist_cm
- chest_cm
- arm_cm
- leg_cm
- hip_cm

## 5. Implementar autenticacao

Fluxo inicial:

1. Tela de login.
2. Tela de cadastro.
3. Criacao automatica do perfil apos cadastro.
4. Redirecionamento para o app quando autenticado.
5. Logout na tela de perfil.

Comece com email e senha. Login com Google e Apple pode entrar depois.

## 6. Construir as telas com dados mockados

Antes de conectar tudo ao banco, construa as telas com dados locais:

- Lista de exercicios.
- Planilha de treino de exemplo.
- Diario alimentar de exemplo.
- Grafico de carga de exemplo.
- Grafico de peso de exemplo.

Isso ajuda a validar experiencia, layout e fluxo antes de investir em persistencia.

## 7. Implementar biblioteca de exercicios

Primeira versao:

1. Criar lista de exercicios.
2. Exibir nome, grupo muscular, equipamento e midia.
3. Adicionar tela de detalhe com instrucoes.
4. Usar GIFs ou videos curtos hospedados no Supabase Storage.

Depois:

- Filtros por musculo e equipamento.
- Favoritos.
- Substituicoes.
- Visualizacao 3D.

## 8. Implementar planilha de treino

Fluxo do MVP:

1. Usuario cria uma planilha.
2. Usuario cria dias de treino, como Treino A, Treino B e Treino C.
3. Usuario adiciona exercicios em cada dia.
4. Para cada exercicio, define series, repeticoes, carga sugerida e descanso.
5. Usuario inicia o treino a partir da planilha.

## 9. Implementar modo treino

O modo treino deve ser simples e rapido:

- Exercicio atual.
- Series planejadas.
- Campo de carga realizada.
- Campo de repeticoes realizadas.
- Botao para concluir serie.
- Timer de descanso.
- Botao para finalizar treino.

Ao finalizar, salvar:

- Treino realizado.
- Exercicios feitos.
- Series realizadas.
- Carga e repeticoes de cada serie.
- Duracao total.

## 10. Implementar dashboard de treino

Indicadores iniciais:

- Total de treinos por semana.
- Volume semanal.
- Evolucao de carga por exercicio.
- Recordes pessoais.
- Gasto calorico estimado por treino.

Formula basica de volume:

```text
volume = series * repeticoes * carga
```

Depois, adicionar:

- Volume por grupo muscular.
- Comparacao entre semanas.
- Alertas de estagnacao.
- Sugestao de progressao.
- Comparacao entre gasto calorico estimado, duracao do treino e percepcao de esforco.

## 11. Implementar gasto calorico estimado nos treinos

O app deve estimar o gasto calorico de cada treino usando os dados registrados durante a execucao:

- Peso corporal do usuario.
- Exercicios realizados.
- Series feitas.
- Repeticoes feitas.
- Carga usada.
- Tempo total do treino.
- Tempo de descanso.
- Percepcao de esforco, como RPE.

Primeira versao simples:

```text
volume_total = soma(series * repeticoes * carga)
fator_intensidade = volume_total / peso_corporal
calorias_estimadas = tempo_treino_min * met_aproximado * peso_corporal * 0.0175
```

O `met_aproximado` pode comecar como uma tabela simples:

```text
treino_leve = 3.5
treino_moderado = 5.0
treino_intenso = 6.0
treino_muito_intenso = 7.0
```

Depois, o app pode ajustar o MET automaticamente usando volume, descanso e RPE:

```text
se descanso_medio_alto e rpe_baixo: usar MET menor
se volume_alto e rpe_alto: usar MET maior
se treino_curto_mas_muito_pesado: aumentar fator de intensidade
```

Importante: essa estimativa nao deve prometer precisao clinica. Ela deve ser apresentada como uma estimativa para acompanhamento pessoal e comparacao entre treinos.

## 12. Implementar dieta e calorias

Fluxo do MVP:

1. Usuario cadastra alimentos.
2. Usuario registra refeicoes.
3. Usuario informa quantidade em gramas ou porcao.
4. O app calcula calorias e macros.
5. Dashboard mostra consumo versus meta diaria.

Calculo por alimento:

```text
calorias = calorias_por_100g * quantidade_g / 100
proteina = proteina_por_100g * quantidade_g / 100
carboidratos = carboidratos_por_100g * quantidade_g / 100
gorduras = gorduras_por_100g * quantidade_g / 100
```

## 13. Implementar progresso corporal

Primeira versao:

- Registro de peso.
- Registro de medidas.
- Grafico de peso ao longo do tempo.
- Historico de medidas.

Depois:

- Fotos de evolucao.
- Comparativo visual.
- Relatorio mensal.

## 14. Implementar midias dos exercicios

Opcoes:

- GIFs hospedados no Supabase Storage.
- Videos curtos em MP4.
- Modelos 3D em uma etapa futura.

Sugestao pratica:

1. Comece com GIFs ou videos curtos.
2. Padronize proporcao e qualidade.
3. Salve a URL na tabela `exercises`.
4. Carregue a midia na tela de detalhe e no modo treino.

Visualizacao 3D pode ser implementada depois com bibliotecas como Three.js via React Native WebView, ou usando assets pre-renderizados em GIF/video para simplificar o MVP.

## 15. Criar relatorios e insights

Depois que houver dados suficientes:

- Detectar aumento ou queda de volume.
- Detectar carga estagnada por mais de algumas semanas.
- Detectar aumento ou queda no gasto calorico estimado por treino.
- Comparar calorias consumidas com meta.
- Comparar proteina consumida com meta.
- Gerar resumo semanal.

Exemplos de insights:

```text
Sua carga no supino aumentou 7,5 kg nas ultimas 4 semanas.
Voce treinou pernas 1 vez nesta semana, abaixo da sua meta.
Sua proteina ficou abaixo da meta em 5 dos ultimos 7 dias.
```

## 16. Adicionar IA em uma fase futura

Com a OpenAI API, o app pode:

- Gerar uma planilha de treino baseada no perfil.
- Sugerir substituicoes de exercicios.
- Gerar ideias de refeicoes.
- Explicar tecnica de exercicios.
- Criar relatorios semanais em linguagem natural.
- Analisar estagnacao e sugerir ajustes.
- Explicar por que o gasto calorico estimado subiu ou caiu conforme carga, volume, descanso e duracao.

Importante: deixe claro no app que sugestoes de treino e dieta nao substituem acompanhamento profissional.

## 17. Testes e qualidade

Prioridades:

- Testar calculos de calorias e macros.
- Testar calculos de volume.
- Testar calculos de gasto calorico estimado.
- Testar login e sessao.
- Testar salvamento offline ou falha de internet.
- Testar telas em Android e iOS.

Ferramentas possiveis:

- Jest para funcoes puras.
- React Native Testing Library para componentes.
- Expo Go para testes manuais rapidos.

## 18. Publicacao

Primeiro publique uma versao Android interna:

1. Criar conta Google Play Console.
2. Configurar EAS Build.
3. Gerar build Android.
4. Testar com usuarios internos.
5. Corrigir problemas.
6. Publicar beta fechado.

Com Expo:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

## 19. Ordem recomendada de desenvolvimento

1. Setup do projeto com Expo.
2. Navegacao por abas.
3. UI inicial com dados mockados.
4. Supabase e autenticacao.
5. Perfil do usuario.
6. Biblioteca de exercicios.
7. Planilha de treino.
8. Modo treino.
9. Registro de cargas e series.
10. Calculo de volume e gasto calorico estimado.
11. Dashboard de carga, volume e calorias estimadas no treino.
12. Diario alimentar.
13. Calculo de calorias e macros.
14. Dashboard de dieta.
15. Registro de peso e medidas.
16. Fotos de evolucao.
17. Relatorios e insights.
18. IA e recursos premium.

## 20. Checklist do MVP

- [ ] Projeto Expo criado.
- [ ] Navegacao principal criada.
- [ ] Login e cadastro funcionando.
- [ ] Perfil do usuario funcionando.
- [ ] Biblioteca inicial de exercicios.
- [ ] Midia dos exercicios carregando.
- [ ] Planilha de treino criada.
- [ ] Modo treino funcionando.
- [ ] Historico de treino salvo.
- [ ] Dashboard de treino inicial.
- [ ] Gasto calorico estimado por treino.
- [ ] Cadastro de alimentos.
- [ ] Diario alimentar.
- [ ] Calculo de calorias e macros.
- [ ] Dashboard de dieta inicial.
- [ ] Registro de peso.
- [ ] Grafico de progresso.
