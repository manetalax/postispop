import js from '@eslint/js';
import globals from 'globals';
export default [js.configs.recommended,{files:['app/**/*.js','guest-board.js','supabase-bridge.js','commerce-ui.js'],languageOptions:{globals:globals.browser},rules:{'no-empty':['error',{allowEmptyCatch:true}],'no-unused-vars':['error',{argsIgnorePattern:'^_',caughtErrors:'none'}]}},{files:['scripts/*.mjs'],languageOptions:{globals:globals.node}}];
