# Use a imagem Node.js official
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia o restante do código
COPY . .

# Expõe a porta (ajuste conforme necessário)
EXPOSE 3000

# Define o comando padrão
CMD ["node", "server.js"]
