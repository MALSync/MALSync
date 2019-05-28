<template>
  <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content">
      <slot/>
    </span>
    <span class="mdl-list__item-secondary-action">
      <label>
        <input type="file" v-on:change="handleFileUpload($event)" />
      </label>
    </span>
  </li>
</template>

<script type="text/javascript">
  export default {
    methods: {
      handleFileUpload(event){
        con.log('File Found', event);

        if(!window.FileReader) {
          alert('Browser is not compatible')
          return;
        }

        var reader = new FileReader();

        reader.onload = (evt) => {
          if(evt.target.readyState != 2) return;
          if(evt.target.error) {
              alert('Error while reading file');
              return;
          }

          var filecontent = evt.target.result;

          this.$emit('upload', filecontent);

        };

        reader.readAsText(event.target.files[0]);
      }
    }
  }
</script>
