import watch from 'watch';
import colors from 'colors/safe';

export default class AppWatcher {
  constructor(resolver) {
    this.resolver = resolver;
  }

  watchApp() {
    console.log(`Start watching files in "${process.cwd()}/app" for updates...`);

    // start watching files and compile them as you go.
    watch.createMonitor(`${process.cwd()}/app`, { interval: 0.1 }, (monitor) => {
      monitor.on("created", (f, stat) => {
        // Handle new files
        var regex = new RegExp("^" + `${process.cwd()}/app`);
        console.log(colors.green('[+] created new file: ') + f.replace(regex, ''));
        this.resolver.addLayerByFileName(f).then(function(layerContainer) {
          console.log(`Layer registered: ${layerContainer.layerKey.type}:${layerContainer.layerKey.name}\n`);
        });
      })
      monitor.on("changed", (f, curr, prev) => {
        // Handle file changes
        var regex = new RegExp("^" + `${process.cwd()}/app`);
        console.log(colors.blue('[~] changed file: ') + f.replace(regex, ''));
        this.resolver.addLayerByFileName(f).then(function(layerContainer) {
          console.log(`Layer re-registered: ${layerContainer.layerKey.type}:${layerContainer.layerKey.name}\n`);
        });
      })
      monitor.on("removed", (f, stat) => {
        // Handle removed files
        var regex = new RegExp("^" + `${process.cwd()}/app`);
        console.log(colors.red('[-] removed file: ') + f.replace(regex, ''));
        this.resolver.removeLayerByFileName(f).then(function(layerContainer) {
          console.log(`Layer de-registered: ${layerContainer.layerKey.type}:${layerContainer.layerKey.name}\n`);
        });
      })
    });
  }
}
