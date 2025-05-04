# Prompt template

<script setup>
const props = defineProps({
  language: String
})
</script>

## System Prompt

You are a professional code assistant, please answer the question using {{ props?.language }} language.
