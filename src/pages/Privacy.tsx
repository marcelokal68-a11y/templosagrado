import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections: Record<string, { title: string; items: string[] }[]> = {
  'pt-BR': [
    {
      title: '1. Introdução',
      items: [
        'O Templo Sagrado ("nós", "nosso") está comprometido com a proteção da sua privacidade e dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
        'Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar nosso aplicativo.',
      ],
    },
    {
      title: '2. Dados Coletados',
      items: [
        'Dados de cadastro: nome, e-mail e senha (criptografada).',
        'Dados de uso: mensagens enviadas no chat, preferências religiosas/filosóficas, idioma selecionado.',
        'Dados de navegação: logs de acesso, endereço IP (anonimizado), tipo de dispositivo.',
        'Não coletamos dados sensíveis além da preferência religiosa/filosófica informada voluntariamente por você.',
      ],
    },
    {
      title: '3. Finalidade do Tratamento',
      items: [
        'Fornecer orientação espiritual personalizada através do chat.',
        'Gerar versículos e práticas diárias adequadas à sua tradição.',
        'Melhorar a experiência do usuário e a qualidade do serviço.',
        'Comunicações relacionadas ao serviço (nunca spam ou marketing não solicitado).',
      ],
    },
    {
      title: '4. Confidencialidade das Conversas',
      items: [
        'Suas conversas são totalmente confidenciais e criptografadas em trânsito.',
        'Nenhum ser humano tem acesso ao conteúdo das suas conversas — nem mesmo administradores.',
        'No Modo Confessionário, absolutamente nada é salvo ou registrado.',
        'Você pode apagar todo o seu histórico a qualquer momento através do menu do chat.',
      ],
    },
    {
      title: '5. Compartilhamento de Dados',
      items: [
        'Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros.',
        'Utilizamos provedores de infraestrutura (hospedagem e banco de dados) que seguem padrões de segurança internacionais.',
        'Dados podem ser compartilhados apenas mediante ordem judicial ou obrigação legal.',
      ],
    },
    {
      title: '6. Armazenamento e Segurança',
      items: [
        'Seus dados são armazenados em servidores seguros com criptografia.',
        'Implementamos medidas técnicas e organizacionais para proteger contra acesso não autorizado.',
        'Senhas são armazenadas utilizando hash criptográfico (nunca em texto plano).',
      ],
    },
    {
      title: '7. Seus Direitos (LGPD Art. 18)',
      items: [
        'Confirmação da existência de tratamento de dados.',
        'Acesso, correção e exclusão dos seus dados pessoais.',
        'Anonimização, bloqueio ou eliminação de dados desnecessários.',
        'Portabilidade dos dados a outro fornecedor.',
        'Revogação do consentimento a qualquer momento.',
        'Para exercer seus direitos, entre em contato conosco pelo e-mail informado abaixo.',
      ],
    },
    {
      title: '8. Retenção de Dados',
      items: [
        'Seus dados são mantidos enquanto sua conta estiver ativa.',
        'Ao excluir sua conta, todos os dados pessoais serão removidos em até 30 dias.',
        'Dados anonimizados para fins estatísticos podem ser mantidos indefinidamente.',
      ],
    },
    {
      title: '9. Cookies e Armazenamento Local',
      items: [
        'Utilizamos localStorage para preferências de idioma, tema e consentimento LGPD.',
        'Não utilizamos cookies de rastreamento ou de terceiros para publicidade.',
      ],
    },
    {
      title: '10. Contato',
      items: [
        'Para dúvidas sobre esta política ou para exercer seus direitos, entre em contato:',
        'E-mail: privacidade@templosagrado.com.br',
      ],
    },
    {
      title: '11. Alterações',
      items: [
        'Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas através do aplicativo.',
        'Última atualização: Março de 2026.',
      ],
    },
  ],
  en: [
    {
      title: '1. Introduction',
      items: [
        'Sacred Temple ("we", "our") is committed to protecting your privacy and personal data, in compliance with applicable data protection laws.',
        'This Privacy Policy describes how we collect, use, store, and protect your information when using our application.',
      ],
    },
    {
      title: '2. Data Collected',
      items: [
        'Registration data: name, email, and password (encrypted).',
        'Usage data: chat messages, religious/philosophical preferences, selected language.',
        'Navigation data: access logs, IP address (anonymized), device type.',
        'We do not collect sensitive data beyond the religious/philosophical preference you voluntarily provide.',
      ],
    },
    {
      title: '3. Purpose of Processing',
      items: [
        'Provide personalized spiritual guidance through chat.',
        'Generate daily verses and practices suited to your tradition.',
        'Improve user experience and service quality.',
        'Service-related communications (never spam or unsolicited marketing).',
      ],
    },
    {
      title: '4. Conversation Confidentiality',
      items: [
        'Your conversations are completely confidential and encrypted in transit.',
        'No human has access to your conversation content — not even administrators.',
        'In Confessional Mode, absolutely nothing is saved or recorded.',
        'You can delete all your history at any time through the chat menu.',
      ],
    },
    {
      title: '5. Data Sharing',
      items: [
        'We do not sell, rent, or share your personal data with third parties.',
        'We use infrastructure providers (hosting and database) that follow international security standards.',
        'Data may only be shared under court order or legal obligation.',
      ],
    },
    {
      title: '6. Storage and Security',
      items: [
        'Your data is stored on secure servers with encryption.',
        'We implement technical and organizational measures to protect against unauthorized access.',
        'Passwords are stored using cryptographic hashing (never in plain text).',
      ],
    },
    {
      title: '7. Your Rights',
      items: [
        'Confirmation of data processing.',
        'Access, correction, and deletion of your personal data.',
        'Anonymization, blocking, or elimination of unnecessary data.',
        'Data portability to another provider.',
        'Revocation of consent at any time.',
        'To exercise your rights, contact us at the email provided below.',
      ],
    },
    {
      title: '8. Data Retention',
      items: [
        'Your data is kept as long as your account is active.',
        'Upon account deletion, all personal data will be removed within 30 days.',
        'Anonymized data for statistical purposes may be kept indefinitely.',
      ],
    },
    {
      title: '9. Cookies and Local Storage',
      items: [
        'We use localStorage for language, theme, and LGPD consent preferences.',
        'We do not use tracking cookies or third-party advertising cookies.',
      ],
    },
    {
      title: '10. Contact',
      items: [
        'For questions about this policy or to exercise your rights, contact us:',
        'Email: privacidade@templosagrado.com.br',
      ],
    },
    {
      title: '11. Changes',
      items: [
        'This policy may be updated periodically. Significant changes will be communicated through the application.',
        'Last updated: March 2026.',
      ],
    },
  ],
  es: [
    {
      title: '1. Introducción',
      items: [
        'El Templo Sagrado ("nosotros", "nuestro") está comprometido con la protección de su privacidad y datos personales, en cumplimiento con las leyes de protección de datos aplicables.',
        'Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos su información al utilizar nuestra aplicación.',
      ],
    },
    {
      title: '2. Datos Recopilados',
      items: [
        'Datos de registro: nombre, correo electrónico y contraseña (encriptada).',
        'Datos de uso: mensajes de chat, preferencias religiosas/filosóficas, idioma seleccionado.',
        'Datos de navegación: registros de acceso, dirección IP (anonimizada), tipo de dispositivo.',
        'No recopilamos datos sensibles más allá de la preferencia religiosa/filosófica que usted proporciona voluntariamente.',
      ],
    },
    {
      title: '3. Finalidad del Tratamiento',
      items: [
        'Proporcionar orientación espiritual personalizada a través del chat.',
        'Generar versículos y prácticas diarias adecuadas a su tradición.',
        'Mejorar la experiencia del usuario y la calidad del servicio.',
        'Comunicaciones relacionadas con el servicio (nunca spam o marketing no solicitado).',
      ],
    },
    {
      title: '4. Confidencialidad de las Conversaciones',
      items: [
        'Sus conversaciones son completamente confidenciales y encriptadas en tránsito.',
        'Ningún ser humano tiene acceso al contenido de sus conversaciones, ni siquiera los administradores.',
        'En el Modo Confesionario, absolutamente nada se guarda ni registra.',
        'Puede eliminar todo su historial en cualquier momento a través del menú del chat.',
      ],
    },
    {
      title: '5. Compartición de Datos',
      items: [
        'No vendemos, alquilamos ni compartimos sus datos personales con terceros.',
        'Utilizamos proveedores de infraestructura (alojamiento y base de datos) que siguen estándares de seguridad internacionales.',
        'Los datos solo pueden compartirse bajo orden judicial u obligación legal.',
      ],
    },
    {
      title: '6. Almacenamiento y Seguridad',
      items: [
        'Sus datos se almacenan en servidores seguros con encriptación.',
        'Implementamos medidas técnicas y organizativas para proteger contra el acceso no autorizado.',
        'Las contraseñas se almacenan utilizando hash criptográfico (nunca en texto plano).',
      ],
    },
    {
      title: '7. Sus Derechos',
      items: [
        'Confirmación de la existencia de tratamiento de datos.',
        'Acceso, corrección y eliminación de sus datos personales.',
        'Anonimización, bloqueo o eliminación de datos innecesarios.',
        'Portabilidad de datos a otro proveedor.',
        'Revocación del consentimiento en cualquier momento.',
        'Para ejercer sus derechos, contáctenos al correo indicado abajo.',
      ],
    },
    {
      title: '8. Retención de Datos',
      items: [
        'Sus datos se mantienen mientras su cuenta esté activa.',
        'Al eliminar su cuenta, todos los datos personales serán eliminados en un plazo de 30 días.',
        'Los datos anonimizados con fines estadísticos pueden mantenerse indefinidamente.',
      ],
    },
    {
      title: '9. Cookies y Almacenamiento Local',
      items: [
        'Utilizamos localStorage para preferencias de idioma, tema y consentimiento de privacidad.',
        'No utilizamos cookies de rastreo ni cookies publicitarias de terceros.',
      ],
    },
    {
      title: '10. Contacto',
      items: [
        'Para dudas sobre esta política o para ejercer sus derechos, contáctenos:',
        'Email: privacidade@templosagrado.com.br',
      ],
    },
    {
      title: '11. Cambios',
      items: [
        'Esta política puede actualizarse periódicamente. Los cambios significativos se comunicarán a través de la aplicación.',
        'Última actualización: Marzo de 2026.',
      ],
    },
  ],
};

const titles: Record<string, string> = {
  'pt-BR': 'Política de Privacidade',
  en: 'Privacy Policy',
  es: 'Política de Privacidad',
};

export default function Privacy() {
  const { language } = useApp();
  const lang = language as string;
  const content = sections[lang] || sections['pt-BR'];
  const title = titles[lang] || titles['pt-BR'];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>

        {content.map((section, i) => (
          <div key={i} className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            <ul className="space-y-1.5">
              {section.items.map((item, j) => (
                <li key={j} className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
