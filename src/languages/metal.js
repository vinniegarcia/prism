import { toArray } from '../util/iterables.js';
import cpp from './cpp.js';

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
				/\b(?:atomic_(?:bool|float|int|uint|ulong)|depth(?:2d(?:_array|_ms(?:_array)?)?|cube(?:_array)?)|sampler|texture(?:1d(?:_array)?|2d(?:_array|_ms(?:_array)?)?|3d|_buffer|cube(?:_array)?))\b/,
			],
			'keyword': [
				...toArray(tokens['keyword']),
				// address spaces and function qualifiers
				/\b(?:constant|device|fragment|kernel|object_data|ray_data|thread|threadgroup(?:_imageblock)?|vertex)\b/,
				// scalar, vector, packed vector and matrix types
				/\b(?:bfloat|(?:packed_)?(?:bfloat|char|float|half|int|long|short|uchar|uint|ushort)[234]|(?:bool|ulong)[234]|(?:float|half)[234]x[234]|half|ptrdiff_t|size_t|uchar|uint|ulong|ushort)\b/,
			],
			// C++ numbers plus the h (half) and bf (bfloat) suffixes
			'number': {
				pattern:
					/(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)(?:bf|[fhlu]{0,4})/i,
				greedy: true,
			},
			$insert: {
				// [[buffer(0)]], [[thread_position_in_grid]]
				'attribute': {
					$after: 'string',
					pattern: /\[\[[\s\S]*?\]\]/,
					greedy: true,
					alias: 'attr-name',
				},
			},
		};
	},
};
