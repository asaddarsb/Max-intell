const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

async function resolveTailwind() {
  try {
    return require('tailwindcss');
  } catch (err) {
    const mod = await import('tailwindcss');
    return mod.default || mod;
  }
}

// Polyfill String.prototype.matchAll for older Node versions
if (typeof String.prototype.matchAll !== 'function') {
  String.prototype.matchAll = function (regexp) {
    const source = regexp && regexp.source ? regexp.source : String(regexp);
    const flags = regexp && regexp.flags ? (regexp.flags.includes('g') ? regexp.flags : regexp.flags + 'g') : 'g';
    const re = new RegExp(source, flags);
    const str = String(this);
    return (function* () {
      let m;
      while ((m = re.exec(str)) !== null) {
        yield m;
        if (re.lastIndex === m.index) re.lastIndex++;
      }
    })();
  };
}

const args = process.argv.slice(2);
const watch = args.includes('--watch');

const input = path.join(__dirname, '..', 'assets', 'css', 'input.css');
const output = path.join(__dirname, '..', 'assets', 'css', 'dist.css');

function build() {
  fs.readFile(input, 'utf8', (err, css) => {
    if (err) {
      console.error('Failed to read input CSS:', err);
      process.exit(1);
    }

    resolveTailwind().then(tailwind => {
      postcss([tailwind(), autoprefixer])
        .process(css, { from: input, to: output })
        .then(result => {
          fs.mkdirSync(path.dirname(output), { recursive: true });
          fs.writeFileSync(output, result.css);
          if (result.map) fs.writeFileSync(output + '.map', result.map.toString());
          console.log('Built', output);
        })
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
    }).catch(err => {
      console.error('Failed to load tailwindcss:', err);
      process.exit(1);
    });
  });
}

if (watch) {
  build();
  const chokidar = require('chokidar');
  const watcher = chokidar.watch(input, { ignoreInitial: true });
  watcher.on('all', () => {
    console.log('Detected change, rebuilding...');
    build();
  });
} else {
  build();
}
