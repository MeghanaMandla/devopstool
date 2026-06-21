// DevOps troubleshooting database
const TROUBLESHOOT_DB = [
  {
    cat: "kubernetes", icon: "☸️", title: "CrashLoopBackOff",
    symptom: "Pod keeps restarting and shows status CrashLoopBackOff.",
    causes: ["Application crashes on startup", "Missing config map or secret", "Failing liveness probe", "Wrong command/entrypoint in image"],
    fix: "Run `kubectl logs <pod> --previous` to see the crash reason. Check `kubectl describe pod <pod>` for events. Verify environment variables, mounted volumes, and that the container's CMD actually starts a long-running process."
  },
  {
    cat: "kubernetes", icon: "☸️", title: "ImagePullBackOff",
    symptom: "Pod stuck pending, events show ImagePullBackOff or ErrImagePull.",
    causes: ["Wrong image name or tag", "Private registry without imagePullSecrets", "Registry rate limiting", "Network policy blocking egress"],
    fix: "Verify the image name/tag with `docker pull <image>` locally. For private registries, create a secret: `kubectl create secret docker-registry regcred --docker-server=... --docker-username=... --docker-password=...` and reference it in `imagePullSecrets`."
  },
  {
    cat: "kubernetes", icon: "☸️", title: "Pending pods (unschedulable)",
    symptom: "Pod stays in Pending state and never starts.",
    causes: ["Insufficient CPU/memory on nodes", "No nodes match nodeSelector/affinity", "PVC not bound", "Taints without matching tolerations"],
    fix: "Run `kubectl describe pod <pod>` and check the Events section for the scheduler's reason. Scale your node pool, fix resource requests, or adjust node selectors/tolerations."
  },
  {
    cat: "docker", icon: "🐳", title: "Permission Denied",
    symptom: "Docker commands fail with 'permission denied' on the socket.",
    causes: ["User not in the docker group", "Running rootless Docker incorrectly", "SELinux/AppArmor restrictions"],
    fix: "Add your user to the docker group: `sudo usermod -aG docker $USER` then log out and back in. Or run commands with `sudo` as a quick fix (not recommended long-term)."
  },
  {
    cat: "docker", icon: "🐳", title: "Port Already In Use",
    symptom: "Error: 'bind: address already in use' when starting a container.",
    causes: ["Another process or container already bound to that host port", "Previous container with same port wasn't removed"],
    fix: "Find what's using the port: `lsof -i :8080` or `sudo netstat -tulpn | grep 8080`. Kill that process, or map to a different host port: `docker run -p 8081:80 ...`."
  },
  {
    cat: "docker", icon: "🐳", title: "Out Of Memory (OOMKilled)",
    symptom: "Container exits suddenly, `docker inspect` shows OOMKilled: true.",
    causes: ["Container memory limit set too low", "Memory leak in the application", "Too many containers competing for host RAM"],
    fix: "Increase the container's memory limit with `--memory=1g` or in your compose file. Profile the app for memory leaks. Check host memory with `free -h`."
  },
  {
    cat: "docker", icon: "🐳", title: "No Space Left On Device",
    symptom: "Docker build or run fails with 'no space left on device'.",
    causes: ["Too many dangling images/containers/volumes", "Build cache grown very large", "Disk genuinely full"],
    fix: "Clean up with `docker system prune -a --volumes` (careful — removes unused data). Check disk usage with `docker system df` and `df -h`."
  },
  {
    cat: "linux", icon: "🐧", title: "Permission Denied (file access)",
    symptom: "Script or command fails with 'Permission denied'.",
    causes: ["File isn't executable", "Wrong file owner/group", "Restrictive directory permissions"],
    fix: "Make the file executable: `chmod +x script.sh`. Check ownership with `ls -l` and fix with `chown user:group file`. Confirm parent directories have execute (x) permission for traversal."
  },
  {
    cat: "linux", icon: "🐧", title: "Out Of Memory / OOM Killer",
    symptom: "Process unexpectedly dies, dmesg shows 'Out of memory: Killed process'.",
    causes: ["System genuinely low on RAM", "No swap configured", "Memory-hungry process (often a build tool or DB)"],
    fix: "Check `free -h` and `dmesg | grep -i oom`. Add swap space, increase RAM, or limit memory-heavy processes with cgroups/systemd MemoryLimit."
  },
  {
    cat: "linux", icon: "🐧", title: "Disk full but du shows space free",
    symptom: "'No space left on device' even though `df -h` doesn't look full.",
    causes: ["Inode exhaustion (too many small files)", "Deleted-but-open files held by a running process"],
    fix: "Check inodes: `df -i`. For phantom usage, find processes holding deleted files: `lsof | grep deleted` and restart them."
  },
  {
    cat: "jenkins", icon: "⚙️", title: "Pipeline fails at checkout",
    symptom: "Jenkins build fails at the 'Checkout SCM' stage.",
    causes: ["Invalid or expired credentials", "Wrong repository URL or branch", "Jenkins agent lacks git installed"],
    fix: "Verify the credential ID in Jenkins matches what's referenced in the Jenkinsfile. Test repo access manually from the agent: `git clone <url>`. Ensure git is installed on the agent."
  },
  {
    cat: "jenkins", icon: "⚙️", title: "Jenkins agent offline",
    symptom: "Build queued indefinitely, agent shows as offline.",
    causes: ["Agent JVM crashed or ran out of disk", "Network connectivity lost between master and agent", "Outdated agent.jar"],
    fix: "Check agent logs in Jenkins UI under Manage Jenkins → Nodes. Restart the agent service. Confirm disk space and connectivity with `ping`/`telnet` to the master port."
  },
  {
    cat: "git", icon: "📦", title: "Merge Conflict",
    symptom: "Git refuses to merge, shows conflict markers in files.",
    causes: ["Same lines modified differently on both branches", "Diverged history without regular rebasing"],
    fix: "Run `git status` to see conflicted files. Open each, resolve the `<<<<<<<` / `=======` / `>>>>>>>` blocks, then `git add <file>` and `git commit`. Consider rebasing more frequently to avoid large conflicts."
  },
  {
    cat: "git", icon: "📦", title: "Detached HEAD state",
    symptom: "Git warns you are in 'detached HEAD' after checkout.",
    causes: ["Checked out a specific commit hash or tag instead of a branch"],
    fix: "If you want to keep changes, create a new branch: `git checkout -b new-branch-name`. Otherwise simply `git checkout main` to return to your branch."
  },
  {
    cat: "aws", icon: "☁️", title: "Access Denied (IAM)",
    symptom: "AWS CLI or console action fails with 'AccessDenied'.",
    causes: ["IAM policy missing required permission", "Resource-based policy (e.g. S3 bucket policy) blocking access", "Wrong AWS profile/region active"],
    fix: "Check the exact action/resource in the error message. Use IAM Policy Simulator to test. Verify `aws configure list` shows the expected profile and region."
  },
  {
    cat: "aws", icon: "☁️", title: "EC2 instance unreachable",
    symptom: "Cannot SSH into an EC2 instance; connection times out.",
    causes: ["Security group doesn't allow inbound port 22", "Instance has no public IP / wrong subnet routing", "Wrong key pair"],
    fix: "Check the security group inbound rules for port 22 from your IP. Confirm the instance has a public IP and the route table has an Internet Gateway route. Verify you're using the correct .pem key."
  },
  {
    cat: "terraform", icon: "🏗️", title: "State Lock Error",
    symptom: "Terraform apply fails with 'Error acquiring the state lock'.",
    causes: ["A previous apply/plan crashed without releasing the lock", "Two people running terraform simultaneously"],
    fix: "Confirm no other process is actually running. Force-unlock with `terraform force-unlock <LOCK_ID>` (use carefully — only after confirming it's safe)."
  },
  {
    cat: "terraform", icon: "🏗️", title: "Resource already exists",
    symptom: "Apply fails because a resource already exists outside Terraform's state.",
    causes: ["Resource was created manually or by another tool", "State file out of sync with real infrastructure"],
    fix: "Import the existing resource into state: `terraform import <resource_address> <resource_id>`. Then run `terraform plan` to confirm no further changes are needed."
  },
];

function searchTroubleshoot(query, category) {
  const q = (query || "").toLowerCase().trim();
  return TROUBLESHOOT_DB.filter(t => {
    const matchesCat = !category || category === "all" || t.cat === category;
    const matchesQ = !q || t.title.toLowerCase().includes(q) || t.symptom.toLowerCase().includes(q) || t.cat.includes(q);
    return matchesCat && matchesQ;
  });
}
