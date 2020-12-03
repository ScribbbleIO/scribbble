import React from 'react';
import rehypeReact from 'rehype-react';

let processor = {};
rehypeReact.call(processor, {
	Fragment: React.Fragment,
	createElement: React.createElement,
});

export default function hastToReact(hast) {
	return processor.Compiler(hast);
}
