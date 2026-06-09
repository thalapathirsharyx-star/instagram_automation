import os

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements:
    # 1. Floating icons - Replace Twitter with a Bot icon
    content = content.replace(
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F39F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>'
    )
    
    # 2. Revenue Chart -> Leads Captured
    content = content.replace('>$162,751<', '>14,208<')
    content = content.replace('>Last year<', '>Leads This Month<')
    content = content.replace('>$23,827<br/><span className="text-zinc-400 font-medium">August</span>', '>3,104<br/><span className="text-zinc-400 font-medium">This Week</span>')
    
    # 3. Rewards -> AI Responses
    content = content.replace('>Rewards<', '>AI Agent<')
    content = content.replace('>Points<', '>Responses sent<')
    content = content.replace('>172,832<', '>284,912<')
    # Replace avatar with lightning bolt or similar
    content = content.replace(
        '<img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />',
        '<div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>'
    )
    
    # 4. Marketing Copy
    content = content.replace('Turn your ideas<br/>into reality.', 'Turn conversations<br/>into revenue.')
    content = content.replace('Consistent quality and experience across<br/>all platforms and devices.', 'Automate Instagram DMs, capture qualified leads,<br/>and sync customer data instantly.')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file_path}")

path = "c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/pages/"
update_file(path + "Login.tsx")
update_file(path + "Signup.tsx")
