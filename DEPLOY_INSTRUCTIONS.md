# Instruções para Publicar no GitHub

## Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Crie um novo repositório com o nome: `TibiaManagerSite` (ou outro nome de sua preferência)
3. **NÃO** inicialize com README, .gitignore ou license (já temos esses arquivos)
4. Clique em "Create repository"

## Passo 2: Conectar Repositório Local ao GitHub

Execute os seguintes comandos no terminal (substitua `SEU_USUARIO` pelo seu usuário do GitHub):

```bash
cd "C:\Users\admin\Documents\TibiaManagerSite"
git remote add origin https://github.com/SEU_USUARIO/TibiaManagerSite.git
git push -u origin main
```

## Passo 3: Habilitar GitHub Pages

1. Acesse o repositório no GitHub
2. Vá em **Settings** > **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. O workflow já está configurado e será executado automaticamente após o push

## Passo 4: Acessar o Site

Após o deploy (alguns minutos), o site estará disponível em:
```
https://SEU_USUARIO.github.io/TibiaManagerSite/
```

## Verificação

O GitHub Actions irá:
- Executar automaticamente a cada push na branch `main`
- Fazer deploy do site para GitHub Pages
- Você pode acompanhar o progresso em **Actions** no repositório
