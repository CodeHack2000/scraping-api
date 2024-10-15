import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  // Configurações para JavaScript comum
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: {
      // Regras específicas do ESLint
      "semi": ["error", "always"], // Exigir ponto e vírgula no final das linhas
      "quotes": ["error", "single"], // Usar aspas simples
      "indent": ["error", 4], // Usar quatro espaços para indentação
      "no-unused-vars": "warn", // Avisar sobre variáveis não utilizadas
      "eqeqeq": ["error", "always"], // Exigir uso de === e !==
      "no-console": "off", // Permitir o uso de console.log (pode ser mudado para "warn" ou "error" conforme necessário)
    },
  },
  // Configurações globais para Node.js
  {
    languageOptions: { globals: globals.node },
  },
  // Inclui as configurações recomendadas do ESLint
  pluginJs.configs.recommended,
];
