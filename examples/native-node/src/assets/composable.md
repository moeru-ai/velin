## Prompt Composable

<script setup>
import { ref } from 'vue';
import { useTask } from './assets/task';

const markdown = ref('')
const { task } = useTask()
</script>

## User Prompt

{{ markdown }}

## Task

{{ task }}
