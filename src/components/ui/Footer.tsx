import {  FolderGit2 ,Globe, Mail, GitPullRequest, Bug } from 'lucide-react'

const contact = {
  portfolio: 'https://portafoliojeisonreyes.netlify.app/',
  email: 'reyesjeison2006@gmail.com',
  repo: 'https://github.com/JEISON101/DuelUp.git',
}

const linkClass =
  'inline-flex items-center gap-2 text-sm text-white-muted transition-colors hover:text-[#f5c542] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c542] rounded'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className='mt-10 border-t border-white/[0.09] px-4 py-8 sm:px-6'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <div className='grid gap-6 sm:grid-cols-2'>
          {/* CONTACTO */}
          <div>
            <h3 className='text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-100/[0.52]'>
              Contacto
            </h3>
            <ul className='mt-3 space-y-2'>
              <li>
                <a className={linkClass} href={contact.portfolio} target='_blank' rel='noopener noreferrer'>
                  <Globe size={16} />
                  Portafolio
                </a>
              </li>
              <li>
                <a
                  className={linkClass}
                  href={`${contact.repo}`}
                >
                  <FolderGit2 size={16} />Repositorio
                </a>
              </li>
              <li>
                <p className={`${linkClass} break-all`}>
                  <Mail size={16} className='flex-none' />
                  {contact.email}
                </p>
              </li>
            </ul>
          </div>

          {/* COLABORACIÓN */}
          <div>
            <h3 className='text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-100/[0.52]'>
              Colabora
            </h3>
            <ul className='mt-3 space-y-3 text-sm text-white-muted'>
              <li className='flex items-start gap-2'>
                <GitPullRequest size={16} className='mt-0.5 flex-none text-[#91b7ff]' />
                <span>
                  ¿Tienes una mejora? Deja tu pull request.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <Bug size={16} className='mt-0.5 flex-none text-[#91b7ff]' />
                <span>
                  ¿Encontraste un error o tienes problemas? Escríbeme a mi correo o abre un issue.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className='border-t border-white/[0.09] pt-4 text-center text-xs text-white-muted'>
          © {year} DuelUP. Hecho por Tu Nombre. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}