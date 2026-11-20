import { toArray } from '../util/iterables.js';
import cpp from './cpp.js';

// Metal Shading Language Specification, version 4.1
// https://developer.apple.com/metal/Metal-Shading-Language-Specification.pdf

/** @type {import('../types.d.ts').LanguageProto<'metal'>} */
export default {
	id: 'metal',
	base: cpp,
	alias: 'msl',
	grammar ({ base }) {
		const tokens = /** @type {import('../types.d.ts').GrammarTokens} */ (base);

		return {
			'class-name': [
				...toArray(tokens['class-name']),
				// textures, samplers and other library types (2.6, 2.9, 2.10, 2.20, 6.17)
				/\b(?:(?:instance_|primitive_)?acceleration_structure|atomic_(?:bool|float|int|uint|ulong)|command_buffer|compute_command|compute_pipeline_state|depth(?:2d(?:_array|_ms(?:_array)?)?|cube(?:_array)?)|mesh_grid_properties|render_command|render_pipeline_state|sampler|texture(?:1d(?:_array)?|2d(?:_array|_ms(?:_array)?)?|3d|_buffer|cube(?:_array)?))\b/,
				// class templates (2.2, 2.3, 2.4, 2.6, 2.7, 2.11 to 2.22)
				/\b(?:array(?:_ref)?|atomic|cooperative_tensor|d?extents|imageblock|interpolant|intersection_(?:function_table|query|result(?:_ref)?)|intersector|matrix|mesh|packed_vec|patch_control_point|(?:r|rg|rgba)(?:8|16)[su]norm|rg11b10f|rgb10a2|rgb9e5|simdgroup_matrix|srgba8unorm|tensor|uniform|vec|vertex_value|visible_function_table)(?=\s*<)/,
			],
			'keyword': [
				...toArray(tokens['keyword']),
				// address spaces (4) and graphics and kernel function qualifiers (5.1)
				/\b(?:constant|device|fragment|kernel|object_data|ray_data|thread|threadgroup(?:_imageblock)?|vertex)\b/,
				// scalar, vector, packed vector, matrix and SIMD-group matrix types (2.1 to 2.4)
				/\b(?:bfloat|(?:packed_)?(?:bfloat|char|float|half|int|long|short|uchar|uint|ushort)[234]|(?:bool|ulong)[234]|(?:float|half)[234]x[234]|half|ptrdiff_t|simdgroup_(?:bfloat|float|half)8x8|size_t|uchar|uint|ulong|ushort)\b/,
			],
			'constant': [
				...toArray(tokens['constant']),
				// math constants (6.6), memory orders and thread scopes (6.10, 6.16), texture memory coherence (2.9)
				/\b(?:HUGE_VAL(?:BF|F|H)|INFINITY|MAX(?:BFLOAT|FLOAT|HALF)|M_(?:1_PI|2_PI|2_SQRTPI|E|LN10|LN2|LOG10E|LOG2E|PI|PI_2|PI_4|SQRT1_2|SQRT2)_(?:BF|F|H)|NAN|__METAL(?:_[A-Z\d]+)*__|memory_coherence_(?:device|threadgroup)|memory_order_(?:acq_rel|acquire|relaxed|release|seq_cst)|thread_scope_(?:device|simdgroup|thread|threadgroup))\b/,
			],
			// floating-point literals may end in f, h or bf (2.1)
			'number': {
				pattern:
					/(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)(?:bf|[fhlu]{0,4})/i,
				greedy: true,
			},
			$insert: {
				// [[buffer(0)]], [[thread_position_in_grid]], [[kernel]], [[host_name("name")]] (5.1, 5.2)
				'attribute': {
					$after: 'string',
					pattern: /\[\[(?:[^\[\]"]|"(?:\\[\s\S]|[^"\\\r\n])*"|\[[^\[\]]*\])*\]\]/,
					greedy: true,
					alias: 'attr-name',
					inside: {
						'attribute-arguments': {
							pattern: /\((?:[^()]|\([^()]*\))*\)/,
							inside: 'metal',
						},
						'punctuation': /\[\[|\]\]|::|,/,
					},
				},
				// sampler states (2.10), texture access (2.9), interpolation (2.18), per-vertex values (2.19),
				// mesh topology (2.20), barrier memory flags (6.10.1), gather components (6.13),
				// imageblock data rates (6.14), render commands (6.17) and ray tracing (6.19)
				'scoped-enum': {
					$before: 'class-name',
					pattern:
						/\b(?:access|address|border_color|compare_func|component|coord|cull_mode|curve_basis|curve_type|depth_clip_mode|filter|forced_opacity|geometry_cull_mode|geometry_type|imageblock_data_rate|interpolation|mag_filter|mem_flags|memory_coherence|min_filter|mip_filter|opacity_cull_mode|primitive_type|r_address|reduction|s_address|t_address|thread_scope|topology|triangle_cull_mode|triangle_fill_mode|vertex_index|winding)\s*::\s*\w+/,
					inside: {
						'class-name': /^\w+/,
						'double-colon': {
							pattern: /::/,
							alias: 'punctuation',
						},
						'constant': /\w+$/,
					},
				},
				// the Metal standard library namespaces (6.1, 6.6, 6.19)
				'namespace': {
					$before: 'class-name',
					pattern:
						/(\bnamespace\s+)(?:metal|raytracing)\b|\b(?:fast|metal|precise|raytracing)(?=\s*::)/,
					lookbehind: true,
				},
			},
			$merge: {
				'generic-function': {
					inside: {
						'generic': {
							inside: 'metal',
						},
					},
				},
			},
		};
	},
};
