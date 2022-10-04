declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    getOption: (key: string) => string;
    lang: (key: string, args?: string[]) => string;
  }
}

export {};
