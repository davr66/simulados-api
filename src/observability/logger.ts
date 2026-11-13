type CamposLog = Record<string, unknown>;

function escrever(
  nivel: 'info' | 'error',
  mensagem: string,
  campos: CamposLog = {},
): void {
  const entrada = {
    timestamp: new Date().toISOString(),
    level: nivel,
    message: mensagem,
    ...campos,
  };

  const linha = JSON.stringify(entrada);

  if (nivel === 'error') {
    console.error(linha);
    return;
  }

  console.log(linha);
}

export const logger = {
  info(mensagem: string, campos?: CamposLog): void {
    escrever('info', mensagem, campos);
  },

  error(mensagem: string, campos?: CamposLog): void {
    escrever('error', mensagem, campos);
  },
};
