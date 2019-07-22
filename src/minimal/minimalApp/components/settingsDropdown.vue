<template>
  <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content">
      {{text}}
    </span>
    <span class="mdl-list__item-secondary-action">
      <select name="myinfo_score" v-model="value" class="inputtext mdl-textfield__input" style="outline: none;" >
        <slot/>
      </select>
    </span>
  </li>
</template>

<script type="text/javascript">
  export default {
    props: {
      option: {
        type: String
      },
      text: {
        type: String
      }
    },
    computed: {
      value: {
        get: function () {
          return api.settings.get(this.option);
        },
        set: function (value) {
          api.settings.set(this.option, value);
          this.$emit('changed', value);
        }
      },
    },
  }
</script>
