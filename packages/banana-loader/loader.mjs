import * as path from 'node:path';
import module from 'node:module';
import { fileURLToPath } from 'node:url'


const DEFAULT_EXTENSIONS = ['.banana'];

const compile = async (code, filepath) => {
  // We are second loader in chain so we have PnP injected yay all this works
  const pnpApi = module.findPnpApi(filepath);
  const packageLocator = pnpApi.findPackageLocator(filepath);
  const packageInformation = pnpApi.getPackageInformation(packageLocator);
  const configFile = path.join(packageInformation.packageLocation, 'banana.config.mjs');

    // This fails complaining that "banana-config" cannot be resolved
  const configModule = await import(configFile);

  if (configModule.default.magic !== 42) {
    throw new Error('Bad banana');
  }

  return code;
}

export const load = async (url, context, nextLoad) => {
  if (DEFAULT_EXTENSIONS.some((ext) => url.endsWith(ext))) {
    const {source, responseURL, format} = await nextLoad(url, {...context, format: 'module'});    
    const code = await compile(source.toString('utf8'), fileURLToPath(responseURL));
    return {
      format,
      source: code,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}