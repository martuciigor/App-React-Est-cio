# 🏥 Consulte Já - Sistema de Localização de Medicamentos em UBS

Este projeto consiste em um aplicativo mobile focado em transparência pública e utilidade social, desenvolvido em **React Native** com integração direta ao **Google Cloud Firestore (via API REST)**. O objetivo é permitir que cidadãos consultem o estoque de farmácias comunitárias antes de se deslocarem.

---

## 👥 Integrantes do Grupo

* **Igor Martuci** - Matrícula: 202402550683
  
---

## 🎯 Problema Social Resolvido

### O Cenário da Saúde Pública e a Assimetria de Informação
O Sistema Único de Saúde (SUS) é uma das maiores políticas públicas de inclusão do mundo, garantindo acesso universal a tratamentos e medicamentos. No entanto, a gestão descentralizada das farmácias das Unidades Básicas de Saúde (UBS) frequentemente sofre com um problema crônico: **a falta de comunicação em tempo real com o cidadão**. 

Atualmente, o paciente que recebe uma receita médica precisa se deslocar fisicamente até uma UBS para tentar retirar o medicamento. Quando chega ao local, é comum deparar-se com estoques zerados. Esse cenário gera impactos socioeconômicos profundos:
* **Prejuízo Financeiro e de Tempo:** Pacientes de baixa renda gastam recursos escassos com transporte público ou combustível, além de horas de deslocamento e filas, muitas vezes de forma totalmente em vão.
* **Sobrecarga das Unidades:** As recepções e guichês das farmácias das UBS ficam congestionados com pessoas que estão ali apenas para fazer uma pergunta simples: *"Tem este remédio hoje?"*.
* **Piora no Quadro Clínico:** A frustração de não encontrar o medicamento e a falta de previsibilidade de quando ele estará disponível fazem com que muitos pacientes interrompam ou atrasem tratamentos essenciais.

### O Desafio Crítico dos Medicamentos Específicos
O problema torna-se ainda mais grave quando tratamos de **medicamentos muito específicos, de alto custo ou voltados para doenças crônicas/raras** (como esquemas de antibióticos restritos, corticoides específicos ou moduladores hormonais). Diferente do Paracetamol ou da Dipirona, que possuem alta rotatividade e distribuição em larga escala, os medicamentos específicos são distribuídos em lotes menores e estratégicos. 

Sem uma ferramenta centralizada, rastrear em qual bairro ou unidade da cidade aquele lote específico foi depositado torna-se uma tarefa quase impossível para o cidadão comum, resultando em uma peregrinação exaustiva por múltiplos postos de saúde.

### A Solução Proposta pelo "Consulte Já"
O aplicativo atua diretamente na resolução dessa dor social por meio da **democratização do acesso à informação**. Ao digitalizar e expor o estoque de medicamentos de cada UBS de forma simples, direta e atualizável, o projeto garante:
1. **Eficiência Logística para o Cidadão:** O usuário descobre instantaneamente se o remédio (específico ou comum) está disponível e em qual unidade perto dele, planejando sua viagem de forma certeira.
2. **Equidade no Acesso:** Reduz o abismo de informação, permitindo que a tecnologia sirva como um braço de suporte à dignidade humana e à continuidade de tratamentos médicos.

---

### 📢 Nota de Escopo e Arquitetura (Esclarecimento Acadêmico)

**Aviso Importante sobre as Funcionalidades de Inserção, Edição e Remoção (CRUD):**

Em um cenário de produção real, um aplicativo voltado ao cidadão final seria estritamente **Read-Only (Apenas Leitura)**. Permitir que o usuário comum altere, adicione ou remova medicamentos do estoque de uma Unidade Básica de Saúde (UBS) quebraria todas as premissas de segurança, integridade de dados e governança pública.

**Por que essas funções estão presentes no app?**
As operações de escrita e modificação (criar, editar e excluir remédios diretamente na interface) foram implementadas **exclusivamente como critérios obrigatórios de avaliação acadêmica**. Elas servem como uma *Prova de Conceito (PoC)* para demonstrar o domínio técnico sobre manipulação de estados complexos, consumo completo de verbos HTTP (`POST`, `PATCH`, `DELETE`) e persistência de dados em tempo real utilizando a API REST do Google Cloud Firestore.

**Como seria a Arquitetura Real do Sistema?**
Na arquitetura ideal de produção do "Consulte Já", o fluxo de dados operaria da seguinte forma:
1. **Fonte da Verdade (SSOT):** Os dados de estoque seriam originados diretamente dos sistemas internos oficiais de gestão de medicamentos do governo (como o e-SUS ou sistemas municipais integrados).
2. **Atualização Passiva:** À medida que a própria farmácia da UBS desse baixa física em um medicamento (via leitor de código de barras ou sistema interno ao atender um paciente), essa informação seria sincronizada em segundo plano no banco de dados centralizado.
3. **Consumo de API Oficial:** O aplicativo faria apenas requisições do tipo `GET` em uma API governamental segura para coletar esses dados consolidados e exibi-los em um painel de busca amigável para o cidadão final, garantindo a imutabilidade e a confiabilidade das informações na ponta.

---

## 🚀 Instruções de Como Rodar o App

O projeto está configurado, hospedado e pronto para avaliação imediata através da plataforma **Expo Snack**, dispensando a necessidade de instalar ambientes pesados de desenvolvimento na sua máquina local.

### 📌 1. Link de Acesso à Plataforma
👉 **<a href="https://snack.expo.dev/@martuciigor/app-ubs-estacio?platform=web" target="_blank">Clique aqui para abrir o projeto no Expo Snack</a>**

### 🕹️ 2. Como Interagir e Executar o Aplicativo

Assim que a página do Expo Snack carregar no seu navegador, utilize o painel de simulação localizado no **lado direito da tela** através de uma das opções abaixo:

#### Opção A: Execução via Navegador (Aba Web - Recomendado)
1. No menu superior do simulador (à direita), clique na aba **Web**.

<img width="1866" height="869" alt="image" src="https://github.com/user-attachments/assets/3b40ba03-d118-4bf5-8b7d-48df1c73390f" />

2. O aplicativo será renderizado diretamente na página.
3. ⚠️ **Nota Importante para o Avaliador:** Se o aplicativo detectar que não há registros no banco, um botão vermelho aparecerá no topo escrito: **"⚡ CLIQUE AQUI PARA CRIAR AS UNIDADES ⚡"**. Clique nele uma vez; o aplicativo injetará os dados de teste na nuvem do Firebase e atualizará a lista na hora.

#### Opção B: Execução no Celular Físico (Aba My Device)
1. Baixe o aplicativo gratuito **Expo Go** no seu smartphone (disponível na Google Play Store para Android ou App Store para iOS).
2. Na aba **My Device** do simulador do computador, um **QR Code** será exibido.
3. Abra o app Expo Go (no Android) ou a câmera nativa (no iOS) e **escaneie o código**.
4. O aplicativo será carregado direto no seu celular para testes táteis nativos.

#### Opção C: Emuladores Virtuais (Abas Android ou iOS)
1. Clique nas respectivas abas **Android** ou **iOS** no painel direito.
2. Clique no botão azul **Tap to Play** para iniciar um dispositivo móvel virtualizado na nuvem. *(Nota: Esta opção pode conter filas de espera dependendo da carga dos servidores do Expo).*

### ⚠️ Importante: Aviso sobre Dependências (Caso Necessário)
Devido ao comportamento de cache do ambiente virtual do Expo Snack, a plataforma pode eventualmente exibir uma mensagem de erro em uma **tarja vermelha na parte inferior da tela** alertando sobre pacotes não instalados. 
* Se essa mensagem aparecer, basta clicar no texto vermelho escrito **"Add Dependency"** (ou "Add missing dependencies"). 
* A própria plataforma vai baixar e sincronizar os pacotes necessários automaticamente em segundos e o aplicativo funcionará perfeitamente.
