<script setup>
import { ref } from 'vue'

const props = defineProps({
  date: String,
})

const count = ref(0)
</script>

<div>
  <h1>Count: {{ count }}</h1>
  <p>{{ props.date }}</p>
</div>
