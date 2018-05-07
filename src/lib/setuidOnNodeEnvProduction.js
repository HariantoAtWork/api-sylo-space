const setuidOnNodeEnvProduction = () => {
	if (process.env.NODE_ENV === 'production') {
		let GID = process.env.GID
		let UID = process.env.UID
		try {
			console.log('Old User ID: ' + process.getuid() + ', Old Group ID: ' + process.getgid())
			console.info(JSON.stringify({ GID, UID }))
			process.setgroups([!isNaN(GID) ? GID : 'www-data'])
			process.setgid( !isNaN(GID) ? GID : 'www-data' )
			process.setuid( !isNaN(UID) ? UID : 'www-data' )
			console.log('New User ID: ' + process.getuid() + ', New Group ID: ' + process.getgid())
		} catch (err) {
			console.log('Cowardly refusing to keep the process alive as root. Please run as: www-data:www-data')
			process.exit(1) 
		}

	}
}

module.exports = setuidOnNodeEnvProduction