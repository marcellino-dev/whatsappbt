# WhatsApp Widget

Widget de atendimento via WhatsApp com formulario de captura de leads. Funciona em qualquer site HTML sem dependencias externas.

---

## Instalacao rapida

Adicione a tag `<script>` antes do fechamento do `</body>` no seu HTML:

```html
<script
  src="whats-widget.js"
  data-numero="5547999999999"
  data-mensagem="Ola, vim do site e gostaria de mais informacoes!"
  data-cor="#25d366"
  data-titulo="Falar com um consultor"
  data-subtitulo="Preencha os dados para iniciar o atendimento"
></script>
```

---

## Atributos obrigatorios

| Atributo       | Descricao                                                                 | Exemplo                  |
|----------------|---------------------------------------------------------------------------|--------------------------|
| `data-numero`  | Numero do WhatsApp com DDI + DDD, somente digitos, sem espacos ou sinais  | `5547999999999`          |

---

## Atributos opcionais

| Atributo          | Descricao                                      | Padrao                                              |
|-------------------|------------------------------------------------|-----------------------------------------------------|
| `data-mensagem`   | Mensagem pre-preenchida enviada ao WhatsApp    | `Ola, vim do site!`                                 |
| `data-cor`        | Cor principal do widget (hex ou rgb)           | `#25d366`                                           |
| `data-titulo`     | Titulo exibido no cabecalho do modal           | `Falar com um consultor`                            |
| `data-subtitulo`  | Subtitulo exibido abaixo do titulo             | `Preencha os dados para iniciar o atendimento`      |
| `data-webhook`    | URL para receber os dados do formulario (POST) | _(vazio)_                                           |

---

## Integracao com CRM ou automacao (webhook)

Quando `data-webhook` esta configurado, o widget envia um `POST` com `Content-Type: application/json` para a URL informada logo apos o usuario clicar em "Iniciar conversa".

**Exemplo de payload enviado:**

```json
{
  "nome": "Maria Silva",
  "telefone": "(47) 99999-9999",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "verao2025",
  "utm_term": "comprar produto"
}
```

Os campos UTM sao capturados automaticamente da URL ou de cookies, com validade de 7 dias.

---

## Mapeamento de campos para CRM

Se o seu CRM usa nomes de campos diferentes de `nome` e `telefone`, voce pode remapear:

```html
data-campo-integrado-nome="name"
data-campo-integrado-telefone="phone"
```

---

## Campos personalizados

Voce pode adicionar quantos campos extras quiser. Cada campo usa o padrao `data-campo-personalizado-N-*` onde `N` e o numero sequencial (1, 2, 3...).

**Propriedades disponiveis por campo:**

| Sufixo          | Descricao                                                   |
|-----------------|-------------------------------------------------------------|
| `-nome`         | Nome do campo (obrigatorio para criar o campo)              |
| `-tipo`         | `text`, `email`, `tel`, `number`, `select`, `textarea`      |
| `-placeholder`  | Texto de exemplo dentro do campo                            |
| `-obrigatorio`  | `true` para exigir preenchimento, `false` para opcional     |
| `-opcoes`       | Para tipo `select`: lista de opcoes separadas por virgula   |

**Exemplo com campos extras:**

```html
<script
  src="whats-widget.js"
  data-numero="5547999999999"
  data-mensagem="Ola, tenho interesse nos seus servicos!"
  data-cor="#128C7E"
  data-titulo="Falar com um consultor"
  data-subtitulo="Preencha os dados para iniciar o atendimento"
  data-webhook="https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/"

  data-campo-personalizado-1-nome="Nome da Empresa"
  data-campo-personalizado-1-tipo="text"
  data-campo-personalizado-1-placeholder="Digite o nome da empresa"
  data-campo-personalizado-1-obrigatorio="true"

  data-campo-personalizado-2-nome="Servico de Interesse"
  data-campo-personalizado-2-tipo="select"
  data-campo-personalizado-2-opcoes="Consultoria,Desenvolvimento,Suporte,Outro"
  data-campo-personalizado-2-placeholder="Selecione um servico..."
  data-campo-personalizado-2-obrigatorio="false"
></script>
```

---

## Exemplo completo (igual ao layout original)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Meu Site</title>
</head>
<body>

  <!-- Conteudo do site aqui -->

  <script
    src="whats-widget.js"
    data-numero="5547999999999"
    data-mensagem="Ola, vim do site e gostaria de mais informacoes!"
    data-cor="#25d366"
    data-titulo="Falar com um consultor"
    data-subtitulo="Preencha os dados para iniciar o atendimento"
    data-webhook="https://seuwebhook.com/endpoint"

    data-campo-personalizado-1-nome="Nome da Empresa"
    data-campo-personalizado-1-tipo="text"
    data-campo-personalizado-1-placeholder="Digite o nome da empresa"
    data-campo-personalizado-1-obrigatorio="true"

    data-campo-personalizado-2-nome="Servico de Interesse"
    data-campo-personalizado-2-tipo="select"
    data-campo-personalizado-2-opcoes="Consultoria,Desenvolvimento,Suporte,Outro"
    data-campo-personalizado-2-placeholder="Selecione um servico..."
    data-campo-personalizado-2-obrigatorio="false"
  ></script>

</body>
</html>
```

---

## Captura automatica de UTMs

O widget detecta e armazena automaticamente os parametros UTM da URL em cookies (validade: 7 dias). Eles sao incluidos no payload do webhook e na mensagem do WhatsApp sem nenhuma configuracao adicional.

Parametros capturados: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`.

Se nao houver UTM na URL, o widget registra o `document.referrer` como `utm_source`.

---

## Formatacao do telefone

O campo de telefone aplica mascara automatica no formato brasileiro: `(99) 99999-9999`. So digitos sao enviados no payload do webhook para facilitar o uso em APIs e CRMs.

---

## Compatibilidade

- Funciona em qualquer site HTML, WordPress, Webflow, Wix (via codigo customizado), Shopify
- Sem dependencias externas (sem jQuery, sem frameworks)
- Compativel com Chrome, Firefox, Safari, Edge (versoes modernas)
- Responsivo para mobile e desktop

---

## Perguntas frequentes

**O widget aparece em todas as paginas?**
Sim. Ao adicionar o script no layout global do site, ele aparece em todas as paginas automaticamente.

**Posso usar mais de um numero?**
Nao. Cada instancia do script suporta um numero. Para multiplos numeros, seria necessario adaptar o codigo.

**O webhook e obrigatorio?**
Nao. Se `data-webhook` for omitido, o widget funciona normalmente abrindo o WhatsApp sem enviar dados para nenhum servidor externo.

**O script afeta o desempenho do site?**
Nao. O script e leve (sem dependencias), carrega de forma sincrona apenas apos o `</body>` e nao bloqueia o carregamento da pagina.
