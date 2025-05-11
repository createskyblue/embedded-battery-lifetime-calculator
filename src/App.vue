<template>

	<body>
		<div>
			<div class="py-4 text-center text-3xl font-extrabold">
				<span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
					标题
				</span>
			</div>
			<div class="mt-4 text-center">
				<el-button type="primary">测试Element Plus按钮</el-button>
			</div>
		</div>
	</body>
</template>

<script>
import * as echarts from 'echarts'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import axios from 'axios'
import './styles/index.css'

export default {
	setup() {
	},
	data() {
		return {
			
		}
	},
	async mounted() {
		
	},
	beforeUnmount() {
		
	},
	watch: {
		// ...其他 watch 保持不变...
	},
	computed: {
	},
	methods: {
	},
	created() {
	},
	unmounted() {
	}
}
</script>

<style scoped>

</style>
