
# 🏥 Gestão de Capelania HAB

Sistema de gestão hospitalar para capelães, focado no registro de estudos bíblicos, pequenos grupos, classes bíblicas e atendimento a colaboradores.

## 🚀 Funcionalidades

- **PWA (Progressive Web App):** Pode ser instalado no celular como um aplicativo nativo.
- **Modo Híbrido:** Funciona offline (salva no navegador) e sincroniza automaticamente com a nuvem quando há internet.
- **Relatórios em PDF:** Gera relatórios detalhados com gráficos para a administração.
- **Gestão de Acesso:** Login individual para cada capelão.

## 🛠️ Como configurar o Banco de Dados (Firebase)

Para que o sistema salve os dados online, você precisará de uma conta no Firebase:

1. Vá para o [Console do Firebase](https://console.firebase.google.com/).
2. Crie um novo projeto chamado "Capelania".
3. Em **Build > Realtime Database**, clique em "Criar banco de dados".
4. Nas **Regras**, altere `.read` e `.write` para `true` (para testes) ou configure a autenticação.
5. Vá em **Configurações do Projeto > Seus Aplicativos** e adicione um aplicativo Web `</>`.
6. Copie o objeto `firebaseConfig`.
7. No sistema de Capelania, entre como Administrador (`pastorescopel@gmail.com`), vá em **Administração** e cole as credenciais.

## 📦 Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos deste projeto.
3. No GitHub, vá em **Settings > Pages**.
4. Em "Branch", escolha `main` e a pasta `/ (root)`.
5. Clique em salvar. Em alguns minutos, seu app estará online no link fornecido!

---
*Desenvolvido para o Ministério de Capelania.*
