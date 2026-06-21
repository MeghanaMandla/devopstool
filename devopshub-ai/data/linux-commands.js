// Linux command database — searchable by keyword
const LINUX_COMMANDS = [
  { q: "find large files", cmd: "find / -type f -size +100M 2>/dev/null", explain: "Searches the entire filesystem for files larger than 100MB, suppressing permission errors.", related: ["du -sh *", "find . -size +1G", "ncdu /"] },
  { q: "find files modified today", cmd: "find / -mtime -1 -type f 2>/dev/null", explain: "Finds files modified within the last 24 hours.", related: ["find . -mmin -60", "find / -newer file.txt"] },
  { q: "check disk usage", cmd: "df -h", explain: "Shows disk space usage for all mounted filesystems in human-readable format.", related: ["du -sh /var/log", "lsblk", "ncdu"] },
  { q: "check folder size", cmd: "du -sh /path/to/folder", explain: "Shows the total size of a folder in human-readable format (e.g. 4.2G).", related: ["du -h --max-depth=1", "df -h"] },
  { q: "check memory usage", cmd: "free -h", explain: "Displays total, used, and free RAM and swap memory in human-readable units.", related: ["top", "htop", "vmstat 1"] },
  { q: "check running processes", cmd: "ps aux", explain: "Lists all currently running processes with CPU/memory usage, user, and PID.", related: ["top", "htop", "pgrep -f name"] },
  { q: "kill a process", cmd: "kill -9 <PID>", explain: "Forcefully terminates a process by its Process ID. Use 'kill -15' for a graceful shutdown first.", related: ["pkill processname", "killall nginx"] },
  { q: "find process using port", cmd: "lsof -i :8080", explain: "Shows which process is using port 8080. Useful for resolving 'port already in use' errors.", related: ["netstat -tulpn | grep 8080", "ss -tulpn"] },
  { q: "check listening ports", cmd: "netstat -tulpn", explain: "Lists all TCP/UDP ports currently listening with the owning process.", related: ["ss -tulpn", "lsof -i"] },
  { q: "change file permissions", cmd: "chmod 755 file.sh", explain: "Sets read/write/execute permissions: owner=7 (rwx), group=5 (r-x), others=5 (r-x).", related: ["chmod +x script.sh", "chown user:group file"] },
  { q: "change file owner", cmd: "chown user:group file.txt", explain: "Changes the owner and group of a file or directory.", related: ["chown -R user:group /dir", "chmod 644 file"] },
  { q: "search text in files", cmd: "grep -r 'searchterm' /path", explain: "Recursively searches all files in a directory for a text pattern.", related: ["grep -i 'term' file.txt", "grep -n 'term' file.txt"] },
  { q: "compress a folder", cmd: "tar -czvf archive.tar.gz /path/to/folder", explain: "Creates a compressed gzip tarball of a directory. c=create, z=gzip, v=verbose, f=filename.", related: ["tar -xzvf archive.tar.gz", "zip -r archive.zip folder/"] },
  { q: "extract tar file", cmd: "tar -xzvf archive.tar.gz", explain: "Extracts a gzip-compressed tarball. x=extract, z=gzip, v=verbose, f=filename.", related: ["unzip archive.zip", "tar -tf archive.tar.gz (list contents)"] },
  { q: "check system uptime", cmd: "uptime", explain: "Shows how long the system has been running, number of users, and load averages.", related: ["w", "who -b"] },
  { q: "view system logs", cmd: "journalctl -xe", explain: "Shows the most recent systemd journal entries with extra explanation for errors.", related: ["tail -f /var/log/syslog", "dmesg | tail"] },
  { q: "check open files limit", cmd: "ulimit -n", explain: "Shows the maximum number of open file descriptors allowed for the current shell.", related: ["ulimit -a", "cat /proc/sys/fs/file-max"] },
  { q: "create a symbolic link", cmd: "ln -s /path/to/target /path/to/link", explain: "Creates a symbolic (soft) link pointing to the target file or directory.", related: ["ln target hardlink (hard link)"] },
  { q: "check cpu info", cmd: "lscpu", explain: "Displays detailed CPU architecture information including cores, threads, and model.", related: ["nproc", "cat /proc/cpuinfo"] },
  { q: "monitor system resources live", cmd: "htop", explain: "Interactive, color process viewer — a more user-friendly alternative to 'top'.", related: ["top", "glances", "btop"] },
  { q: "copy files over ssh", cmd: "scp file.txt user@host:/remote/path", explain: "Securely copies a file to a remote server over SSH.", related: ["rsync -avz file.txt user@host:/path", "sftp user@host"] },
  { q: "sync directories", cmd: "rsync -avz /source/ user@host:/destination/", explain: "Efficiently synchronizes files between local and remote directories, only transferring changes.", related: ["rsync -avz --delete (mirror exactly)"] },
  { q: "check network connectivity", cmd: "ping -c 4 google.com", explain: "Sends 4 ICMP echo requests to test network connectivity and latency.", related: ["traceroute google.com", "curl -I https://google.com"] },
  { q: "view environment variables", cmd: "printenv", explain: "Lists all environment variables currently set in the shell session.", related: ["echo $PATH", "export VAR=value"] },
  { q: "schedule a cron job", cmd: "crontab -e", explain: "Opens the crontab editor to schedule recurring tasks. Format: min hour day month weekday command.", related: ["crontab -l (list jobs)", "0 2 * * * /script.sh (daily at 2am)"] },
  { q: "check disk inodes", cmd: "df -i", explain: "Shows inode usage per filesystem — useful when disk has space but 'no space left on device' errors occur.", related: ["df -h"] },
  { q: "restart a service", cmd: "sudo systemctl restart nginx", explain: "Restarts a systemd-managed service. Replace 'nginx' with any service name.", related: ["systemctl status nginx", "systemctl enable nginx"] },
  { q: "check service status", cmd: "systemctl status nginx", explain: "Shows whether a systemd service is active, its recent logs, and PID.", related: ["systemctl is-active nginx", "journalctl -u nginx"] },
  { q: "list docker containers", cmd: "docker ps -a", explain: "Lists all Docker containers, including stopped ones. Remove '-a' to see only running containers.", related: ["docker ps", "docker container ls"] },
  { q: "view docker logs", cmd: "docker logs -f <container_id>", explain: "Streams live logs from a running Docker container. -f follows the log output.", related: ["docker logs --tail 100 <id>"] },
];

function searchLinuxCommands(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return LINUX_COMMANDS.filter(c =>
    c.q.toLowerCase().includes(q) ||
    c.cmd.toLowerCase().includes(q) ||
    c.explain.toLowerCase().includes(q)
  );
}
