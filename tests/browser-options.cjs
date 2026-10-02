// Opt in only when the local test launcher is authorized to use /dev/shm.
// Chromium and Playwright must both use the same RAM-backed temporary area:
// setting only the child environment leaves the profile/download staging on disk.
const fs=require('node:fs');
const useSharedMemory=process.env.POSTISPOP_USE_SHM==='1';
if(useSharedMemory){
  fs.accessSync('/dev/shm',fs.constants.W_OK);
  process.env.TMPDIR='/dev/shm';
}
function browserOptions(overrides={}){
  const options={headless:true,executablePath:process.env.POSTISPOP_CHROME,...overrides};
  if(useSharedMemory){
    if(options.ignoreDefaultArgs===true)throw Error('POSTISPOP_USE_SHM requires an explicit ignoreDefaultArgs list');
    options.ignoreDefaultArgs=[...new Set([...(options.ignoreDefaultArgs||[]),'--disable-dev-shm-usage'])];
    options.env={...process.env,...(options.env||{}),TMPDIR:'/dev/shm'};
  }
  return options;
}
module.exports={browserOptions,useSharedMemory};
