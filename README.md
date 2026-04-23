# WhatsApp Widget

Widget de atendimento via WhatsApp com formulário de captura de leads. Funciona em qualquer site HTML sem dependências externas.

---

## Instalação rápida

Adicione a tag `<script>` antes do fechamento do `</body>` no seu HTML:

```html
<script
  src="https://whatsredirect.vercel.app/script"
  data-numero="5547999999999"
  data-mensagem="Olá, vim do site e gostaria de mais informações!"
  data-cor="#25d366"
  data-titulo="Falar com um consultor"
  data-subtitulo="Preencha os dados para iniciar o atendimento"
></script>
```

---

## Atributos obrigatórios

| Atributo      | Descrição                                                                | Exemplo         |
|---------------|--------------------------------------------------------------------------|-----------------|
| `data-numero` | Número do WhatsApp com DDI + DDD, somente dígitos, sem espaços ou sinais | `5547999999999` |

---

## Atributos opcionais

| Atributo          | Descrição                                      | Padrão                                         |
|-------------------|------------------------------------------------|------------------------------------------------|
| `data-mensagem`   | Mensagem pré-preenchida enviada ao WhatsApp    | `Olá, vim do site!`                            |
| `data-cor`        | Cor principal do widget (hex ou rgb)           | `#25d366`                                      |
| `data-titulo`     | Título exibido no cabeçalho do modal           | `Falar com um consultor`                       |
| `data-subtitulo`  | Subtítulo exibido abaixo do título             | `Preencha os dados para iniciar o atendimento` |
| `data-webhook`    | URL para receber os dados do formulário (POST) | _(vazio)_                                      |

---

## Integração com CRM ou automação (webhook)

Quando `data-webhook` está configurado, o widget envia um `POST` com `Content-Type: application/json` para a URL informada logo após o usuário clicar em "Iniciar conversa".

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

Os campos UTM são capturados automaticamente da URL ou de cookies, com validade de 7 dias.

---

## Mapeamento de campos para CRM

Se o seu CRM usa nomes de campos diferentes de `nome` e `telefone`, você pode remapear:

```html
data-campo-integrado-nome="name"
data-campo-integrado-telefone="phone"
```

---

## Campos personalizados

Você pode adicionar quantos campos extras quiser. Cada campo usa o padrão `data-campo-personalizado-N-*` onde `N` é o número sequencial (1, 2, 3...).

**Propriedades disponíveis por campo:**

| Sufixo          | Descrição                                                 |
|-----------------|-----------------------------------------------------------|
| `-nome`         | Nome do campo (obrigatório para criar o campo)            |
| `-tipo`         | `text`, `email`, `tel`, `number`, `select`, `textarea`    |
| `-placeholder`  | Texto de exemplo dentro do campo                          |
| `-obrigatorio`  | `true` para exigir preenchimento, `false` para opcional   |
| `-opcoes`       | Para tipo `select`: opções separadas por vírgula          |

---

## Exemplo completo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Meu Site</title>
</head>
<body>

  <!-- Conteúdo do site aqui -->

  <script
    src="https://whatsredirect.vercel.app/script"
    data-numero="5547999999999"
    data-mensagem="Olá, vim do site e gostaria de mais informações!"
    data-cor="#25d366"
    data-titulo="Falar com um consultor"
    data-subtitulo="Preencha os dados para iniciar o atendimento"
    data-webhook="https://seuwebhook.com/endpoint"

    data-campo-personalizado-1-nome="Nome da Empresa"
    data-campo-personalizado-1-tipo="text"
    data-campo-personalizado-1-placeholder="Digite o nome da empresa"
    data-campo-personalizado-1-obrigatorio="true"

    data-campo-personalizado-2-nome="Serviço de Interesse"
    data-campo-personalizado-2-tipo="select"
    data-campo-personalizado-2-opcoes="Consultoria,Desenvolvimento,Suporte,Outro"
    data-campo-personalizado-2-placeholder="Selecione um serviço..."
    data-campo-personalizado-2-obrigatorio="false"
  ></script>

</body>
</html>
```

---

## Captura automática de UTMs

O widget detecta e armazena automaticamente os parâmetros UTM da URL em cookies com validade de 7 dias. Eles são incluídos no payload do webhook sem nenhuma configuração adicional.

Parâmetros capturados: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`.

Se não houver UTM na URL, o widget registra o `document.referrer` como `utm_source`, ou `direct` caso não haja referenciador.

---

## Formatação do telefone

O campo de telefone aplica máscara automática no formato brasileiro `(47) 99999-9999` para exibição. O valor com máscara é enviado no payload do webhook — se o seu CRM exigir somente dígitos, remova a formatação no lado do servidor antes de salvar.

---

## Compatibilidade

- Funciona em qualquer site HTML, WordPress, Webflow, Wix (via código customizado) e Shopify
- Sem dependências externas — não requer jQuery nem frameworks
- Compatível com Chrome, Firefox, Safari e Edge (versões modernas)
- Responsivo para mobile e desktop

---

## Perguntas frequentes

**O widget aparece em todas as páginas?**
Sim. Ao adicionar o script no layout global do site, ele aparece em todas as páginas automaticamente.

**Posso usar mais de um número?**
Não. Cada instância do script suporta um número. Para múltiplos números seria necessário adaptar o código.

**O webhook é obrigatório?**
Não. Se `data-webhook` for omitido, o widget funciona normalmente abrindo o WhatsApp sem enviar dados para nenhum servidor externo.

**O script afeta o desempenho do site?**
Não. O script é leve, sem dependências, e não bloqueia o carregamento da página pois é inserido antes do `</body>`.
